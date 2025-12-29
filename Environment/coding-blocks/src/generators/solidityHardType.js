import * as Blockly from 'blockly';
export const solidityGenerator = new Blockly.Generator('sol');
import './renderer.js';

const globalVariableTypesLean = ['ADDRESS', 'NUMBER', 'STRING', 'WEI', 'BOOL'] //address, int256, string, wei, bool
Blockly.defineBlocksWithJsonArray([
  {
      "type": "recievingFunction",
      "message0": "Recieving Function",
      "nextStatement": null,
      "colour": 160,
      "tooltip": "This function is triggered when ETH is sent to your contract",
      "helpUrl": ""
  },{
      "type": "fallbackFunction",
      "message0": "Fallback Function",
      "nextStatement": null,
      "colour": 160,
      "tooltip": "This function is triggered when data is sent to your contract",
      "helpUrl": ""
  },{
      "type": "constructorFunction",
      "message0": "Constructor Function",
      "nextStatement": null,
      "colour": 160,
      "tooltip": "This function is triggered only once when your contract is deployed",
      "helpUrl": ""
  }])
Blockly.Blocks['generalFunction'] = {
  init: function() {
    this.jsonInit({
      "type": "generalFunction",
      "message0": "Function called %1",
      "args0": [
        {
          "type": "field_input",
          "name": "name",
          "text": "defaultName"
        }
      ],
      "message1": "only callable %1",
      "args1": [
        {
          "type": "field_dropdown",
          "name": "operator",
          "options": [
            ["by anybody", "by anybody"],
            ["internally", "internally"],
            ["by owner", "by owner"]
          ]
        }
      ],
      "message2": "Inputs",
      "nextStatement": null,
      "colour": 160,
      "tooltip": "Other contracts/users can call this function automatically",
      "helpUrl": "",
      "mutator": "generalFunction_mutator"
    });

    // Track how many parameter inputs we have.
    this.paramCount_ = 1;

    // Create one input for the first parameter by default.
    this.appendValueInput("PARAM0")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Parameter 1");

    // Sanitize the user input for the function name.
    this.getField('name').setValidator(this.sanitizeName);
  },

  sanitizeName: function(name) {
    // Replace spaces with underscores
    let sanitized = name.replace(/\s+/g, '_');

    // Remove invalid characters (only letters, numbers, underscores allowed)
    sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');

    // Ensure the first character is a letter or underscore
    if (!/^[a-zA-Z_]/.test(sanitized)) {
      sanitized = '_' + sanitized;
    }

    return sanitized;
  }
};

Blockly.Blocks['generalFunction_container'] = {
  init: function() {
    this.setStyle('procedure_blocks');
    this.appendDummyInput()
        .appendField("Inputs");
    this.appendStatementInput('STACK');
    this.setColour(160);
    this.setTooltip("Add or remove Inputs");
    this.contextMenu = false;
  }
};
var generalFunctionMutator = {
  saveExtraState: function() {
    return (this.paramCount_ === 1) ? null : { "paramCount": this.paramCount_ };
  },

  loadExtraState: function(state) {
    if (state && typeof state.paramCount === 'number') {
      this.paramCount_ = state.paramCount;
      this.updateShape_();
    }
  },

  mutationToDom: function() {
    var container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('param_count', this.paramCount_);
    return container;
  },

  domToMutation: function(xmlElement) {
    this.paramCount_ = parseInt(xmlElement.getAttribute('param_count'), 10);
    this.updateShape_();
  },

  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('generalFunction_container');
    containerBlock.initSvg();

    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.paramCount_; i++) {
      var itemBlock = workspace.newBlock('generalFunction_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },

  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var i = 0;
    while (itemBlock) {
      var input = this.getInput('PARAM' + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  },

  compose: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var connections = [];
    while (itemBlock && !itemBlock.isInsertionMarker()) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    for (var i = 0; i < this.paramCount_; i++) {
      var connection = this.getInput('PARAM' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.paramCount_ = connections.length;
    this.updateShape_();
    for (var j = 0; j < this.paramCount_; j++) {
      connections[j] && connections[j].reconnect(this, 'PARAM' + i);
    }
  },

  updateShape_: function() {
    // Remove existing inputs.
    var i = 0;
    while (this.getInput('PARAM' + i)) {
      this.removeInput('PARAM' + i);
      i++;
    }
    // Recreate them.
    for (var j = 0; j < this.paramCount_; j++) {
      this.appendValueInput('PARAM' + j)
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField("Parameter " + (j + 1));
    }
  }
};
Blockly.Blocks['generalFunction_item'] = {
init: function() {
  this.setStyle('procedure_blocks');
  this.appendDummyInput()
      .appendField("Parameter");
  this.setPreviousStatement(true);
  this.setNextStatement(true);
  this.setColour(160);
  this.setTooltip("A single parameter to this function.");
  this.contextMenu = false;
}
};

Blockly.Extensions.registerMutator(
'generalFunction_mutator',
  generalFunctionMutator,
null,
['generalFunction_item']
);

/***************************************************************
 * Utility function to find the nearest parent scope name.
 * We scan upward until we find one of:
 *   - generalFunction
 *   - constructorFunction
 *   - fallbackFunction
 *   - recievingFunction
 * Returns the function name (e.g. "myFunction") or one of:
 *   - "constructor"
 *   - "fallback"
 *   - "receive"
 * or null if none is found.
 ***************************************************************/
function findParentScopeName(block) {
  let parent = block.getParent();
  while (parent) {
    switch (parent.type) {
      case 'generalFunction': {
        const fnName = parent.getFieldValue('name') || 'UnnamedFunction';
        return fnName;
      }
      case 'constructorFunction':
        return 'constructor';
      case 'fallbackFunction':
        return 'fallback';
      case 'recievingFunction':
        return 'receive';
    }
    parent = parent.getParent();
  }
  return null;
}

/***************************************************************
 * recievingFunction / fallbackFunction / constructorFunction
 * These have no typed inputs/outputs, so we typically don't need
 * dynamic scope checks. We can leave them as is.
 ***************************************************************/

/***************************************************************
 * contractOwner
 * Output: "ADDRESS" -> becomes "ADDRESS::scope" on change.
 ***************************************************************/
Blockly.Blocks['contractOwner'] = {
  init: function() {
    this.jsonInit({
      "type": "contractOwner",
      "message0": "This contract address %1",
      "args0": [
        {
          "type": "input_dummy",
          "name": "value"
        }
      ],
      "output": "ADDRESS",
      "colour": 160,
      "tooltip": "This is the contract's owner address",
      "helpUrl": ""
    });
    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    if (!scope) {
      // If no scope found, you can default or remove checks
      this.setOutput(true, null);
      return;
    }
    const finalOutputType = `ADDRESS::${scope}`;
    this.setOutput(true, finalOutputType);
  }
};

/***************************************************************
 * addressInformation
 * Input: "ADDRESS" -> "ADDRESS::scope"
 * Output: "NUMBER" -> "NUMBER::scope"
 ***************************************************************/
Blockly.Blocks['addressInformation'] = {
  init: function() {
    this.jsonInit({
      "type": "addressInformation",
      "message0": "Balance of %1 address",
      "args0": [
        {
          "type": "input_value",
          "name": "addressData",
          "check": "ADDRESS"
        }
      ],
      "output": "NUMBER",
      "colour": 230,
      "tooltip": "Balance of etherium on address",
      "helpUrl": ""
    });
    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    if (!scope) {
      // No scope => no checks
      this.getInput('addressData').setCheck(null);
      this.setOutput(true, null);
      return;
    }
    // Merge base types
    const inputType = `ADDRESS::${scope}`;
    const outputType = `NUMBER::${scope}`;
    this.getInput('addressData').setCheck(inputType);
    this.setOutput(true, outputType);
  }
};

/***************************************************************
 * sendEth
 * Two inputs: "uint256" and "ADDRESS" 
 * We'll treat "uint256" like "NUMBER" in scope terms, or keep "uint256" if you prefer.
 ***************************************************************/
Blockly.Blocks['sendEth'] = {
  init: function() {
    this.jsonInit({
      "type": "sendEth",
      "message0": "Send %1 ether to %2",
      "args0": [
        {
          "type": "input_value",
          "name": "data",
          "check": "uint256"
        },
        {
          "type": "input_value",
          "name": "data",
          "check": "ADDRESS"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Send ether to *address* ",
      "helpUrl": ""
    });
    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    // The input fields have the same name "data" repeated,
    // but let's assume we can retrieve them by index:
    const inputList = this.inputList || [];
    if (!scope) {
      inputList.forEach(inp => inp.setCheck(null));
      return;
    }
    // First input (amount) is "uint256", second is "ADDRESS"
    // We'll unify them to "uint256::scope" and "ADDRESS::scope"
    if (inputList[0]) inputList[0].setCheck(`uint256::${scope}`);
    if (inputList[1]) inputList[1].setCheck(`ADDRESS::${scope}`);
  }
};

/***************************************************************
 * emit
 * Input: "STRING" -> "STRING::scope"
 * No output, so only update the input
 ***************************************************************/
Blockly.Blocks['emit'] = {
  init: function() {
    this.jsonInit({
      "type": "emit",
      "message0": "Emit notification %1",
      "args0": [
        {
          "type": "input_value",
          "name": "data",
          "check": "STRING"
        }
      ],
      "nextStatement": null,
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Data about the object interacting with contract",
      "helpUrl": ""
    });
    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    const input = this.getInput('data');
    if (!scope) {
      input && input.setCheck(null);
      return;
    }
    input && input.setCheck(`STRING::${scope}`);
  }
};

/***************************************************************
 * userString
 * Output: "STRING" -> "STRING::scope"
 ***************************************************************/
Blockly.Blocks['userString'] = {
  init: function() {
    this.jsonInit({
      "type": "userString",
      "message0": "%1",
      "args0": [
        {
          "type": "field_input",
          "name": "data",
          "spellcheck": false
        }
      ],
      "output": "STRING",
      "colour": 230,
      "tooltip": "Input your string",
      "helpUrl": ""
    });
    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    if (!scope) {
      this.setOutput(true, null);
      return;
    }
    this.setOutput(true, `STRING::${scope}`);
  }
};

/***************************************************************
 * require
 * Input: "requisite" -> e.g. "BOOL"
 *        "errorMessage" -> e.g. "STRING"
 * (If you want them typed, we unify them with the scope.)
 ***************************************************************/
Blockly.Blocks['require'] = {
  init: function() {
    this.jsonInit({
      "type": "require",
      "message0": "require %1",
      "args0": [
        { "type": "input_value", "name": "requisite" }
      ],
      "message1": "error message %1",
      "args1": [
        { "type": "input_value", "name": "errorMessage" }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "tooltip": "If this statement fails, terminates contract",
      "colour": 120
    });
    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    const reqInput = this.getInput('requisite');
    const errInput = this.getInput('errorMessage');
    if (!scope) {
      reqInput && reqInput.setCheck(null);
      errInput && errInput.setCheck(null);
      return;
    }
    // If you want them typed, let's say "BOOL::scope" and "STRING::scope"
    reqInput && reqInput.setCheck(`BOOL::${scope}`);
    errInput && errInput.setCheck(`STRING::${scope}`);
  }
};

/***************************************************************
 * while
 * Input: "stat" -> "BOOL::scope" (for typical usage)
 * No typed output. Has a statement input "while" for the body.
 ***************************************************************/
Blockly.Blocks['while'] = {
  init: function() {
    this.jsonInit({
      "type": "while",
      "message0": "while %1",
      "args0": [
        { "type": "input_value", "name": "stat" }
      ],
      "message1": "do %1",
      "args1": [
        { "type": "input_statement", "name": "while" }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "tooltip": "While this is true, run this code",
      "colour": 120
    });
    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    const conditionInput = this.getInput('stat');
    if (!scope) {
      conditionInput && conditionInput.setCheck(null);
      return;
    }
    // We'll unify "BOOL::scope"
    conditionInput && conditionInput.setCheck(`BOOL::${scope}`);
  }
};

// The JSON lists "while" block twice. If they're truly duplicates, 
// you'll do the same approach for both or unify them.

/***************************************************************
 * checkCompare
 * Inputs: "NUMBER::scope" or "STRING::scope" if you want, but typically numeric compare => "NUMBER"
 * Output: "BOOL::scope"
 ***************************************************************/
Blockly.Blocks['checkCompare'] = {
  init: function() {
    this.jsonInit({
      "type": "checkCompare",
      "message0": " is %1 %2 %3 ?",
      "args0": [
        { "type": "input_value", "name": "one" },
        { 
          "type": "field_dropdown", 
          "name": "comparator", 
          "options": [
            [">",">"], ["<","<"], [">=",">="], ["<=","<="], ["=","="], ["!=","!="]
          ]
        },
        { "type": "input_value", "name": "two" }
      ],
      "output": "BOOL",
      "tooltip": "While this is true, run this code",
      "colour": 60
    });
    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    const inputOne = this.getInput('one');
    const inputTwo = this.getInput('two');
    if (!scope) {
      inputOne && inputOne.setCheck(null);
      inputTwo && inputTwo.setCheck(null);
      this.setOutput(true, null);
      return;
    }
    // We'll assume numeric comparison => base type "NUMBER"
    const finalIn = `NUMBER::${scope}`;
    const finalOut = `BOOL::${scope}`;
    inputOne && inputOne.setCheck(finalIn);
    inputTwo && inputTwo.setCheck(finalIn);
    this.setOutput(true, finalOut);
  }
};

/***************************************************************
 * conjoiners
 * Inputs: "BOOL::scope"
 * Output: "BOOL::scope"
 ***************************************************************/
Blockly.Blocks['conjoiners'] = {
  init: function() {
    this.jsonInit({
      "type": "conjoiners",
      "message0": " %1 %2 %3",
      "args0": [
        { "type": "input_value", "name": "one" },
        {
          "type": "field_dropdown",
          "name": "operator",
          "options":[ ["AND","AND"], ["OR","OR"] ]
        },
        { "type": "input_value", "name": "two" }
      ],
      "tooltip": "Join together",
      "colour": 60
    });
    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    const inputOne = this.getInput('one');
    const inputTwo = this.getInput('two');
    if (!scope) {
      inputOne && inputOne.setCheck(null);
      inputTwo && inputTwo.setCheck(null);
      this.setOutput(true, null);
      return;
    }
    const finalIn = `BOOL::${scope}`;
    this.getInput('one').setCheck(finalIn);
    this.getInput('two').setCheck(finalIn);

    const finalOut = `BOOL::${scope}`;
    this.setOutput(true, finalOut);
  }
};

/***************************************************************
 * return
 * Input: "data" => Could be anything. Let's treat as "ANYTYPE::scope" or leave it untyped. 
 * There's no typed output. It's a statement block.
 ***************************************************************/
Blockly.Blocks['return'] = {
  init: function() {
    this.jsonInit({
      "type": "return",
      "message0": "return %1",
      "args0": [
        { "type": "input_value", "name": "data" }
      ],
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Return this information to the person who called the function",
      "helpUrl": ""
    });
    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    const input = this.getInput('data');
    if (!scope) {
      input && input.setCheck(null);
      return;
    }
    // If you want to allow any type within the same scope, you can do e.g. ".*::myFn" 
    // but Blockly doesn't do wildcards natively. 
    // We'll do a fallback approach: maybe setCheck to [all possible types in that scope], or just null. 
    // For demonstration let's do "ANY::scope"
    input && input.setCheck(`ANY::${scope}`);
  }
};

/***************************************************************
 * generalFunction
 * Usually doesn't have typed inputs except for the param mutator.
 * We'll keep as is, with your param logic. 
 * If you want param blocks to be typed, do that in the generator or param logic.
 ***************************************************************/

/***************************************************************
 * ifelse
 * "COND" => "BOOL::scope"
 * "IF", "ELSE" => statement inputs, no typed check needed
 ***************************************************************/
Blockly.Blocks['ifelse'] = {
  init: function() {
    this.appendValueInput('COND')
        .setCheck(['BOOL'])
        .appendField('if');
    this.appendStatementInput('IF')
        .appendField('do');
    this.appendStatementInput('ELSE')
        .appendField('else');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('If condition is true, execute "do" statement; otherwise, execute "else" statements.');
    this.setHelpUrl('');

    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    const condInput = this.getInput('COND');
    if (!scope) {
      condInput && condInput.setCheck(null);
      return;
    }
    condInput && condInput.setCheck(`BOOL::${scope}`);
  }
};

/***************************************************************
 * arithmetic
 * Inputs: "NUMBER::scope"
 * Output: "NUMBER::scope"
 ***************************************************************/
Blockly.Blocks['arithmetic'] = {
  init: function() {
    this.appendValueInput('one')
        .setCheck('NUMBER')
        .appendField('');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['+', '+'], ['-', '-'], ['*', '*'], ['/', '/'], ['%', '%']
        ]), 'operator');
    this.appendValueInput('two')
        .setCheck('NUMBER')
        .appendField('');
    this.setInputsInline(true);
    this.setOutput(true, 'NUMBER');
    this.setColour(60);
    this.setTooltip('Perform arithmetic operations with numbers.');
    this.setHelpUrl('');

    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    const inputOne = this.getInput('one');
    const inputTwo = this.getInput('two');
    if (!scope) {
      inputOne && inputOne.setCheck(null);
      inputTwo && inputTwo.setCheck(null);
      this.setOutput(true, null);
      return;
    }
    const finalIn = `NUMBER::${scope}`;
    const finalOut = `NUMBER::${scope}`;
    inputOne && inputOne.setCheck(finalIn);
    inputTwo && inputTwo.setCheck(finalIn);
    this.setOutput(true, finalOut);
  }
};

/***************************************************************
 * messageInformation
 * Base output was "NUMBER" or "ADDRESS" depending on dropdown
 * So we do "NUMBER::scope" or "ADDRESS::scope"
 ***************************************************************/
Blockly.Blocks['messageInformation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("message")
        .appendField(new Blockly.FieldDropdown([
          ["value", "value"],
          ["address", "address"],
          ["data", "data"]
        ]), "messageData");
    this.setOutput(true, "NUMBER"); // default
    this.setColour(230);
    this.setTooltip("Data about the object interacting with the contract");
    this.setHelpUrl("");

    // We already had dynamic output type updates, so let's keep that and also unify scope
    this.setOnChange(this.handleChange.bind(this));
  },

  handleChange: function(event) {
    // First handle the messageData => "NUMBER"/"ADDRESS"
    if (event && 
        event.type === Blockly.Events.CHANGE &&
        event.blockId === this.id &&
        event.element === 'field' &&
        event.name === 'messageData') {
      let sel = this.getFieldValue('messageData');
      if (sel === 'value') sel = 'NUMBER';
      if (sel === 'address') sel = 'ADDRESS';
      // 'data' => maybe treat as "STRING"? or do "BYTES"? We'll skip for brevity.
      if (sel === 'data') sel = 'STRING'; 
      this.setOutput(true, sel);
    }

    // Then unify with scope
    const scope = findParentScopeName(this);
    if (!scope) {
      this.setOutput(true, null);
      return;
    }
    // Check the current output type
    const curCheck = this.outputConnection && this.outputConnection.check_ && this.outputConnection.check_[0];
    if (!curCheck) {
      // no current type or user hasn't changed the dropdown yet
      return;
    }
    // e.g. "NUMBER" -> "NUMBER::myFunction"
    const finalOutType = `${curCheck}::${scope}`;
    this.setOutput(true, finalOutType);
  }
};

/***************************************************************
 * blockInformation
 * Similar approach to messageInformation
 ***************************************************************/
Blockly.Blocks['blockInformation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("block")
        .appendField(new Blockly.FieldDropdown([
          ["timestamp", "timestamp"],
          ["number", "number"],
          ["difficulty", "difficulty"],
          ["gaslimit", "gaslimit"],
          ["basefee", "basefee"]
        ]), "messageData");
    this.setOutput(true, "timestamp"); // default
    this.setColour(230);
    this.setTooltip("Data about/from the current block");
    this.setHelpUrl("");

    this.setOnChange(this.handleChange.bind(this));
  },

  handleChange: function(event) {
    // Possibly handle the output type changes from the dropdown
    if (event && 
        event.type === Blockly.Events.CHANGE &&
        event.blockId === this.id &&
        event.element === 'field' &&
        event.name === 'messageData') {
      let sel = this.getFieldValue('messageData');
      if (sel === 'number') sel = 'NUMBER';
      // e.g. "timestamp" => maybe treat as "NUMBER"? "gaslimit" => "NUMBER"?
      // We'll do a simplistic approach:
      if (sel !== 'NUMBER') sel = 'NUMBER';
      this.setOutput(true, sel);
    }

    // Then unify with scope
    const scope = findParentScopeName(this);
    if (!scope) {
      this.setOutput(true, null);
      return;
    }
    // Get the current check
    const curCheck = this.outputConnection && this.outputConnection.check_ && this.outputConnection.check_[0];
    if (!curCheck) return;

    const finalOutType = `${curCheck}::${scope}`;
    this.setOutput(true, finalOutType);
  }
};

/***************************************************************
 * convertTo
 * Input = "ONE"
 * Output = chosen type from dropdown
 * We unify both with scope
 ***************************************************************/
Blockly.Blocks['convertTo'] = {
  init: function() {
    this.jsonInit({
      "type": "convertTo",
      "message0": "Convert %1 to %2",
      "args0": [
        {
          "type": "input_value",
          "name": "ONE"
        },
        {
          "type": "field_dropdown",
          "name": "TYPE",
          "options": [
            ["ADDRESS","ADDRESS"],
            ["NUMBER","NUMBER"],
            ["STRING","STRING"],
            ["BOOL","BOOL"],
            ["WEI","WEI"]
          ]
        }
      ],
      "output": null,
      "colour": 20,
      "tooltip": "Convert from one type to another.",
      "helpUrl": ""
    });
    this.setOnChange(this.handleOnChange.bind(this));
  },

  handleOnChange: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    const inputBlock = this.getInputTargetBlock('ONE');
    if (!scope) {
      if (inputBlock) inputBlock.setCheck(null);
      this.setOutput(true, null);
      return;
    }

    // The user-chosen target type
    const dropdownField = this.getField('TYPE');
    const targetType = dropdownField && dropdownField.getValue() || 'NUMBER';
    const finalOutType = `${targetType}::${scope}`;

    // For the input, we might not know the base type, so let's unify 
    // it with ".*::scope"? There's no wildcard, so either we do null or
    // we keep the input's existing check but add ::scope. If the input
    // had "ADDRESS::myFn", we can keep that. 
    // For simplicity, let's just do a fallback approach:
    const inputConnection = this.getInput('ONE');
    if (inputConnection) {
      // We can't easily read the base type from the JSON,
      // so we might just do "ANY::scope" or "null". We'll do "null" here:
      inputConnection.setCheck(null);
    }

    // Finally set output
    this.setOutput(true, finalOutType);
  }
};

/***************************************************************
 * string_join
 * two inputs => might be "STRING::scope" or "NUMBER::scope"
 * output => "STRING::scope"
 ***************************************************************/
Blockly.Blocks['string_join'] = {
  init: function() {
    this.jsonInit({
      "type": "string_join",
      "message0": "%1 + %2",
      "args0": [
        { "type": "input_value", "name": "one", "check": null },
        { "type": "input_value", "name": "two", "check": null }
      ],
      "inputsInline": true,
      "output": "STRING",
      "colour": 160,
      "tooltip": "Join strings or numbers into a single string.",
      "helpUrl": ""
    });
    this.setOnChange(this.updateScopeChecks.bind(this));
  },

  updateScopeChecks: function() {
    if (!this.workspace) return;
    const scope = findParentScopeName(this);
    const one = this.getInput('one');
    const two = this.getInput('two');
    if (!scope) {
      one && one.setCheck(null);
      two && two.setCheck(null);
      this.setOutput(true, null);
      return;
    }
    // We'll allow either STRING::scope or NUMBER::scope on both inputs
    // Then output => STRING::scope
    // In Blockly there's no direct way to do "either of these," but
    // we can do an array of checks: setCheck(['STRING::fn','NUMBER::fn']).
    const checkOne = [`STRING::${scope}`, `NUMBER::${scope}`];
    one && one.setCheck(checkOne);
    two && two.setCheck(checkOne);

    this.setOutput(true, `STRING::${scope}`);
  }
};

/***************************************************************
 * variables_get
 * Already merges type with scope at creation time. We'll add an
 * onChange to unify the block with the parent's scope.
 ***************************************************************/
Blockly.Blocks['variables_get'].onchange = function() {
  if (!this.workspace) return;
  const scope = findParentScopeName(this);
  const variableField = this.getField('VAR');
  if (!variableField) return;
  const selectedVariable = variableField.getVariable();
  if (!selectedVariable) return;

  const varType = selectedVariable.type; // e.g. "NUMBER::myFunction"
  // We can verify that varType ends with "::scope", or else no connect
  // But typically, just setOutput(true, varType).
  this.setOutput(true, varType || null);

  // If scope is absent but varType is e.g. "NUMBER::myFunction",
  // you might want to disable the block or set output to null. 
  // For simplicity, we'll do nothing more here.
};

/***************************************************************
 * variables_set
 * We'll do something similar. The variable type is already something
 * like "NUMBER::myFunction". We just set the VALUE input to match.
 ***************************************************************/
Blockly.Blocks['variables_set'].onchange = function() {
  if (!this.workspace) return;
  const scope = findParentScopeName(this);
  const variableDropdown = this.getField('VAR');
  if (!variableDropdown) return;
  const selectedVariable = variableDropdown.getVariable();
  if (!selectedVariable) return;

  const selectedType = selectedVariable.type || 'STRING';
  // e.g. "NUMBER::myFunction"
  const valueInput = this.getInput("VALUE");
  if (valueInput) {
    valueInput.setCheck(selectedType);
  }
  // Optionally, if scope is null or doesn't match the variable's scope,
  // you can disable the block or do further checks.
};


function customVariableCategoryCallback(workspace) {
  const xmlList = [];

  // Add a "Create Variable" button
  const button = document.createElement('button');
  button.setAttribute('text', 'Create a variable');
  button.setAttribute('callbackKey', 'CREATE_CUSTOM_VARIABLE');
  xmlList.push(button);

  // Register the button callback
  workspace.registerButtonCallback('CREATE_CUSTOM_VARIABLE', () => {
      console.log("Custom create variable button triggered");

      // 1) Prompt the user to enter a variable name
      const name = prompt("Enter variable name:");
      if (!name) return;

      // 2) Prompt the user for a variable type (from your globalVariableTypesLean array).
      const types = globalVariableTypesLean; 
      const chosenType = selectFromList("Select variable type:", types);
      if (!chosenType) return;

      // 3) Gather all possible scope blocks: generalFunction, constructorFunction, fallbackFunction, recievingFunction
      const scopeBlocks = [];
      scopeBlocks.push(...workspace.getBlocksByType('generalFunction', false));
      scopeBlocks.push(...workspace.getBlocksByType('constructorFunction', false));
      scopeBlocks.push(...workspace.getBlocksByType('fallbackFunction', false));
      scopeBlocks.push(...workspace.getBlocksByType('recievingFunction', false));

      if (!scopeBlocks.length) {
        alert("No valid function-like blocks found (general, constructor, fallback, or receive). Create one first.");
        return;
      }

      // 4) Build a list of scope names
      const scopeNames = scopeBlocks.map(b => {
        switch (b.type) {
          case 'generalFunction': {
            const fnName = b.getFieldValue('name') || 'UnnamedFunction';
            return fnName;
          }
          case 'constructorFunction':
            return 'constructor';
          case 'fallbackFunction':
            return 'fallback';
          case 'recievingFunction':
            return 'receive';
        }
      });

      // 5) Prompt user to select the scope name
      const selectedScopeName = selectFromList(
        "Select where this variable should be scoped:",
        scopeNames
      );
      if (!selectedScopeName) return;

      // 6) Merge the chosen type with the selected scope name
      const mergedType = `${chosenType}::${selectedScopeName}`;

      // 7) Create the variable in the workspace with the merged type
      workspace.createVariable(name, mergedType);
  });

  // Add variable blocks
  const setBlock = Blockly.utils.xml.createElement('block');
  setBlock.setAttribute('type', 'variables_set');
  xmlList.push(setBlock);

  const getBlock = Blockly.utils.xml.createElement('block');
  getBlock.setAttribute('type', 'variables_get');
  xmlList.push(getBlock);

  return xmlList;
}


/**
 * Helper function to let the user select from a list of options.
 * @param {string} message The message to display to the user.
 * @param {Array<string>} options The list of options to choose from.
 * @returns {string|null} The selected option, or null if the user cancels.
 */
function selectFromList(message, options) {
    // Construct a selection prompt
    const selectionPrompt = `${message}\n\n` + options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
    const userInput = prompt(selectionPrompt);

    // Validate the user's input
    const selectedIndex = parseInt(userInput, 10) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= options.length) {
        alert("Invalid selection. Please try again.");
        return null;
    }

    return options[selectedIndex];
}


const toBox = {
    kind: "categoryToolbox",
    contents: [
      {
        "kind": "category",
        "name": "Headers",
        "contents": [
          {"kind": "block", "type": "generalFunction" },
        ]
      },{
        "kind": "category",
        "name": "Information",
        "contents": [
          {"kind": "block", "type": "messageInformation" },
          {"kind": "block", "type": "blockInformation"},
          {"kind": "block", "type": "contractOwner" },
          {"kind": "block", "type": "addressInformation"},
        ]
      },{
        "kind": "category",
        "name": "Control",
        "contents": [
          {"kind": "block", "type": "ifelse"},
          {"kind": "block", "type": "require"},
          {"kind": "block", "type": "while"},
        ]
      },{
        "kind": "category",
        "name": "Logic",
        "contents": [
          {"kind": "block", "type": "checkCompare"},
          {"kind": "block", "type": "arithmetic"},
          {"kind": "block", "type": "conjoiners"},
          {"kind": "block", "type": "string_join"},
        ]
      },{
        "kind": "category",
        "name": "Actions",
        "contents": [
          {"kind": "block", "type": "emit"},
          {"kind": "block", "type": "sendEth"},
          {"kind": "block", "type": "return"},
        ]
      },
      {
        "kind": "category",
        "name": "Other",
        "contents": [
            {"kind": "block", "type": "userString" },
            {"kind": "block", "type": "convertTo"},
        ],
      },{
          "kind": "category",
          "name": "Variables",
          "custom": "VARIABLE"
      }
    ]
};

export const workspace = function() {
    const options = {
        toolbox: toBox,
        collapse: false,
        comments: true,
        disable: false,
        maxBlocks: Infinity,
        trashcan: false,
        autoClose: false,
        renderer: 'SmartBlocks' //SmartBlocks, geras, thrasos, zelos
    };
    const workingSpace = Blockly.inject("drag-drop", options);
    workingSpace.registerToolboxCategoryCallback('VARIABLE', customVariableCategoryCallback);
    return workingSpace
};
