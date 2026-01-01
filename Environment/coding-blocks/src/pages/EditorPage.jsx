import { useEffect } from 'react';
import * as Blockly from 'blockly';
import './EditorPage.css';
import { solidityGenerator, workspace } from '../generators/solidity.js';
import { deployContract } from '../deployer';

const EditorPage = ( {saveSlot} ) => {

  useEffect(() => {
    const workingSpace = workspace();
    const saveWorkspace = () => {
      const son = Blockly.serialization.workspaces.save(workingSpace);
      const string = JSON.stringify(son)
      if(string.length > 2){
        saveSlot.current = string
        console.log("Saving")
        return string
      }else{
        console.log("Nothing to save")
        return 0
      }
    };
    
    const loadDefaultWorkspace = (internal) => {
      if(internal == true){
        console.log("Internal load ")
        if (saveSlot.current == 0 || saveSlot.current == undefined) return console.log(' Failed');
        try {
          const json = JSON.parse(saveSlot.current);
          Blockly.serialization.workspaces.load(json, workingSpace);
        } catch (err) {
          console.error("Error loading workspace from saveSlot:", err);
        }
      }else{
        console.log("Default load")
        fetch("/defaultWorkspace.json")
          .then(res => res.json())
          .then(json => {
            Blockly.serialization.workspaces.load(json, workingSpace);
          })
          .catch(err => console.error("Error loading workspace:", err));
      }
    };
    if(saveSlot.current != 0){
       loadDefaultWorkspace(true)
    }else{
       loadDefaultWorkspace()
    };
    const downloadCode = () => {
      const code = solidityGenerator.workspaceToCode(workingSpace);
      const blob = new Blob([code], { type: 'application/javascript' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'workspace_code.js';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    

    document.getElementById('saveButton').onclick = saveWorkspace;
    document.getElementById('loadButton').onclick = loadDefaultWorkspace;
    document.getElementById('outputCode').onclick = downloadCode;
    document.getElementById('slot').onclick = deployContract;

    // Ensure Blockly resizes properly after a short delay (post-transition)
    const timer = setTimeout(() => {
      workingSpace.resize();
    }, 350); // Adjust delay to match your transition duration

    return () => {
      clearTimeout(timer);
      const string = saveWorkspace();
      if(string.length > 0)  saveSlot.current = string;
      workingSpace.dispose();
    };
  }, []);
  
  return (
    <div id="large">
      <div id="saveLoad">
        <button id="outputCode">Output Code</button>
        <button id="saveButton">Save Workspace</button>
        <button id="loadButton">Load Workspace</button>
      </div>
      <div id="drag-drop"></div>
    </div>
  );
};

export default EditorPage;
