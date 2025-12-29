import { useEffect } from 'react';
import * as Blockly from 'blockly';
import './EditorPage.css';
import { solidityGenerator, workspace } from '../generators/solidity.js';
import { deployContract } from '../deployer';

const EditorPage = () => {
  useEffect(() => {
    const workingSpace = workspace();

    const saveWorkspace = () => {
      const json = Blockly.serialization.workspaces.save(workingSpace);
      const jsonString = JSON.stringify(json, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'workspace.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const loadDefaultWorkspace = () => {
      fetch('/defaultWorkspace.json')
        .then((res) => res.json())
        .then((json) => Blockly.serialization.workspaces.load(json, workingSpace))
        .catch((error) => console.error('Error loading workspace:', error));
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
