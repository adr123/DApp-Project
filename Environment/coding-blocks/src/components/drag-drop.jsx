//import { useEffect } from "react";
import * as Blockly from "blockly";
import "blockly/javascript"; // JavaScript generator for Blockly
import { BlocklyWorkspace } from "react-blockly";

const DragDropCanvas = () => {
  const toolbox = {
    kind: "flyoutToolbox",
    contents: [
      {
        kind: "block",
        type: "controls_if", // If block
      },
      {
        kind: "block",
        type: "logic_compare", // Comparison block (e.g., "==")
      },
      {
        kind: "block",
        type: "math_number", // Number block
        fields: {
          NUM: 42,
        },
      },
      {
        kind: "block",
        type: "text_print", // Print block
      },
    ],
  };

  const handleWorkspaceChange = (workspace) => {
    try {
      const code = Blockly.JavaScript.workspaceToCode(workspace);
      console.log("Generated Code:\n", code);
    } catch (error) {
      console.error("Error generating code:", error);
    }
  };

  return (
    <div style={{ height: "500px", width: "100%", border: "1px solid #ddd" }}>
      <h2>Drag-and-Drop Coding Blocks</h2>
      <BlocklyWorkspace
        className="blockly-workspace"
        toolboxConfiguration={toolbox} // Toolbox config with blocks
        initialXml={`<xml></xml>`} // Start with empty workspace
        onWorkspaceChange={handleWorkspaceChange}
      />
    </div>
  );
};

export default DragDropCanvas;