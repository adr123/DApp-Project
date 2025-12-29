import * as Blockly from 'blockly';
export const solidityGenerator = new Blockly.Generator('sol');
import './renderer.js';


const globalVariableTypes = [['ADDRESS', 'ADDRESS'],['NUMBER', 'NUMBER'],['STRING', 'STRING'],['BOOL', 'BOOL'],['WEI', 'WEI']];
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
    },{
        "type": "contractOwner",
        "message0": "This contract address %1",
        "args0": [
            {
                "type": "input_dummy",
                "name": "value",
                
            }
        ],
        "output": 'ADDRESS',
        "colour": 160,
        "tooltip": "This is the contract's owner address",
        "helpUrl": ""
    },{
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
    },{
        "type": "sendEth",
        "message0": "Send %1 ether \n to %2",
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
        previousStatement: null,
        nextStatement: null,
        "colour": 230,
        "tooltip": "Send ether to *address* ",
        "helpUrl": ""
    },{
        "type": "emit",
        "message0": "Emit notification %1",
        "args0": [
            {
                "type": "input_value",
                "name": "data",
                "check": "STRING"
            }
        ],
        nextStatement: null,
        previousStatement: null,
        "colour": 230,
        "tooltip": "Data about the object interacting with contract",
        "helpUrl": ""
    },{
        "type": "userString",
        "message0": "%1",
        "args0": [
            {
                "type": "field_input",
                "name": "data",
                "spellcheck": false,
            }
        ],
        "output": "STRING",
        "colour": 230,
        "tooltip": "Input your string",
        "helpUrl": ""
    },{
        "type": "require",
        "message0": "require %1",
        "args0": [
          {"type": "input_value", "name": "requisite"}
        ],
        "message1": "error message %1",
        "args1": [
          {"type": "input_value", "name": "errorMessage"}
        ],
        "previousStatement": null,
        "nextStatement": null,
        "tooltip": "If this statement fails, terminates contract",
        "colour": 120
    },{
        "type": "while",
        "message0": "while %1",
        "args0": [
          {"type": "input_value", "name": "stat"}
        ],
        "message1": "do %1",
        "args1": [
          {"type": "input_statement", "name": "while"}
        ],
        "previousStatement": null,
        "nextStatement": null,
        "tooltip": "While this is true, run this code",
        "colour": 120
    },{
        "type": "while",
        "message0": "while %1",
        "args0": [
          {"type": "input_value", "name": "stat"}
        ],
        "message1": "do %1",
        "args1": [
          {"type": "input_statement", "name": "while"}
        ],
        "previousStatement": null,
        "nextStatement": null,
        "tooltip": "While this is true, run this code",
        "colour": 120
    },{
        "type": "checkCompare",
        "message0": " is %1 %2 %3 ?",
        "args0": [
          {"type": "input_value", "name": "one"},
          {"type": "field_dropdown", "name": "comparator", "options":[
            [">",">"],
            ["<","<"],
            [">=",">="],
            ["<=","<="],
            ["=","="],
            ["!=","!="],
            ]},
          {"type": "input_value", "name": "two"},
        ],
        'output': 'BOOL',
        "tooltip": "While this is true, run this code",
        "colour": 60
    },{
        "type": "conjoiners",
        "message0": " %1 %2 %3",
        "args0": [
          {"type": "input_value", "name": "one"},
          {"type": "field_dropdown", "name": "operator", "options":[
            ["AND","AND"],
            ["OR","OR"],
            ]},
          {"type": "input_value", "name": "two"},
        ],
        "tooltip": "Join together",
        "colour": 60
    },{
        "type": "return",
        "message0": "return %1",
        "args0": [
            {
                "type": "input_value",
                "name": "data",
            }
        ],
        previousStatement: null,
        "colour": 230,
        "tooltip": "Return this information to the person who called the function",
        "helpUrl": ""
    }
]);
Blockly.WorkspaceSvg.prototype.createPredefinedVariables = function () { 
    const predefinedVariables = [
        { name: 'owner', type: 'ADDRESS' }
    ];
    
    predefinedVariables.forEach(variable => {
        this.createVariable(variable.name, variable.type);
    });
};
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
Blockly.Blocks['ifelse'] = {
  init: function() {
    // Add input for the truthy condition
    this.appendValueInput('COND')
        .setCheck(['BOOL'])
        .appendField('if');
    
    // Add a statement input for the "if" branch
    this.appendStatementInput('IF')
        .appendField('do');
    
    // Add a statement input for the "else" branch
    this.appendStatementInput('ELSE')
        .appendField('else');

    // Specify block connectivity and styling
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('If condition is true, execute "do" statement; otherwise, execute "else" statements.');
    this.setHelpUrl('');
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
  
Blockly.Blocks['arithmetic'] = {
  init: function() {
    this.appendValueInput('one')
        .setCheck('NUMBER')
        .appendField(''); // Empty label for alignment
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['+', '+'],
          ['-', '-'],
          ['*', '*'],
          ['/', '/'],
          ['%', '%']
        ]), 'operator');
    this.appendValueInput('two')
        .setCheck('NUMBER')
        .appendField('');
    this.setInputsInline(true);
    this.setOutput(true, 'NUMBER');
    this.setColour(60);
    this.setTooltip('Perform arithmetic operations with numbers.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['messageInformation'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("message")
            .appendField(new Blockly.FieldDropdown([
                ["value", "value"],
                ["address", "address"],
                ["data", "data"],
            ]), "messageData");
        this.setOutput(true, "NUMBER"); // Set a default type
        this.setColour(230);
        this.setTooltip("Data about the object interacting with the contract");
        this.setHelpUrl("");

        // Attach an onchange handler to update the output type dynamically
        this.setOnChange(this.updateOutputType.bind(this));
    },

    /**
     * Updates the output connection type based on the selected dropdown value.
     * @param {Blockly.Events.Abstract} event Change event.
     */
    updateOutputType: function(event) {
        // Check if the change event is due to the dropdown selection
        if (event.type === Blockly.Events.CHANGE &&
            event.blockId === this.id &&
            event.element === 'field' &&
            event.name === 'messageData') {
            // Get the selected type from the dropdown
            var selectedType = this.getFieldValue('messageData');
            if(selectedType == 'value') selectedType = 'NUMBER';
            if(selectedType == 'address') selectedType = 'ADDRESS';
            // Update the output connection check to the selected type
            this.setOutput(true, selectedType);
        }
    }
};
Blockly.Blocks['blockInformation'] = { //set types
    init: function() {
        this.appendDummyInput()
            .appendField("block")
            .appendField(new Blockly.FieldDropdown([
                ["timestamp", "timestamp"],
                ["number", "number"],
                ["difficulty", "difficulty"],
                ["gaslimit", "gaslimit"],
                ["basefee", "basefee"],
            ]), "messageData");
        this.setOutput(true, "timestamp"); // Set a default type
        this.setColour(230);
        this.setTooltip("Data about/from the current block");
        this.setHelpUrl("");

        // Attach an onchange handler to update the output type dynamically
        this.setOnChange(this.updateOutputType.bind(this));
    },

    /**
     * Updates the output connection type based on the selected dropdown value.
     * @param {Blockly.Events.Abstract} event Change event.
     */
    updateOutputType: function(event) {
        // Check if the change event is due to the dropdown selection
        if (event.type === Blockly.Events.CHANGE &&
            event.blockId === this.id &&
            event.element === 'field' &&
            event.name === 'messageData') {
            // Get the selected type from the dropdown
            var selectedType = this.getFieldValue('messageData');
            if(selectedType == 'number') selectedType = 'NUMBER';
            // Update the output connection check to the selected type
            this.setOutput(true, selectedType);
        }
    }
};
Blockly.Blocks['convertTo'] = {
    init: function() {
        this.appendValueInput('ONE')
            .appendField('Convert');
        this.appendDummyInput()
            .appendField('to')
            .appendField(new Blockly.FieldDropdown(globalVariableTypes), 'TYPE');
        this.setOutput(true);
        this.setColour(20);
        this.setTooltip('Convert from one type to another.');
        this.setHelpUrl('');
        this.setOnChange(this.updateConversion.bind(this));
    },

    updateConversion: function() {
        if (!this.workspace) {
            return;
        }

        const inputBlock = this.getInputTargetBlock('ONE');
        let fromType = null;

        if (inputBlock && inputBlock.outputConnection) {
            const checks = inputBlock.outputConnection.getCheck();
            if (checks && checks.length > 0) {
                fromType = checks[0];
            }
        }

        const dropdownField = this.getField('TYPE');
        if (!dropdownField) {
            return;
        }

        let filteredOptions = globalVariableTypes;
        if (fromType) {
            filteredOptions = globalVariableTypes.filter(option => option[0] !== fromType);
        }

        const currentValue = dropdownField.getValue();
        const isValid = filteredOptions.some(opt => opt[1] === currentValue);
        const fallbackValue = filteredOptions.length ? filteredOptions[0][1] : null;
        const newValue = isValid ? currentValue : fallbackValue;

        dropdownField.menuGenerator_ = filteredOptions;
        if (newValue) {
            dropdownField.setValue(newValue);
        } else {
            this.setOutput(false);
            return;
        }

        this.setOutput(true, dropdownField.getValue());
    }
};

Blockly.Blocks['string_join'] = {
  init: function() {
    this.appendValueInput('one')
        .setCheck(null)
        .appendField(''); // Empty label for alignment
    this.appendDummyInput()
        .appendField('+');
    this.appendValueInput('two')
        .setCheck(null)
        .appendField('');
    this.setInputsInline(true);
    this.setOutput(true, 'STRING');
    this.setColour(160);
    this.setTooltip('Join strings or numbers into a single string.');
    this.setHelpUrl('');
  }
};


Blockly.Blocks['variables_get'] = {
  init: function () {
    // Create the variable dropdown field with a default variable named 'owner'
    this.appendDummyInput()
        .appendField(
          new Blockly.FieldVariable(
            'owner', // Default variable name
            null,    // Validator
            globalVariableTypesLean, // Allowed variable types
            'ADDRESS' // Default type for this variable
          ),
          'VAR'
        );

    // Initially set the output to null, which we'll override onChange
    this.setOutput(true, null);
    this.setColour(330);
    this.setTooltip('Returns the value of a variable.');
    this.setHelpUrl('');

    // Attach an onchange handler to keep the block's output type in sync
    this.setOnChange(this.updateOutputType.bind(this));
  },

  /**
   * Updates the output connection check based on the selected variable's type.
   * @param {Blockly.Events.Abstract} event A Blockly event.
   */
  updateOutputType: function() {
    // Safety checks: If the workspace or the field doesn't exist, do nothing.
    if (!this.workspace) return;
    const variableField = this.getField('VAR');
    if (!variableField) return;

    // Retrieve the selected variable
    const selectedVariable = variableField.getVariable();
    if (!selectedVariable) return;

    // The variable's type is stored in selectedVariable.type
    const varType = selectedVariable.type || null;

    // Dynamically set this block's output type to the variable's type
    this.setOutput(true, varType);
  }
};



Blockly.Blocks['variables_set'] = {
    init: function () { 
        // Dropdown for selecting a variable
        this.appendValueInput("VALUE")
            .appendField("set")
            .appendField(new Blockly.FieldVariable('owner', null, null, 'ADDRESS'), "VAR") // Default variable type is STRING
            .appendField("to");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("Assigns a value to a variable.");
    },

    onchange: function () {
        // Get the selected variable's dropdown field
        const variableDropdown = this.getField("VAR");
        if (!variableDropdown) return;

        // Retrieve the selected variable's type safely
        const selectedVariable = variableDropdown.getVariable();
        if (!selectedVariable) {
            console.warn("No variable selected.");
            return;
        }

        const selectedType = selectedVariable.type || 'STRING';

        // Update the check type for the VALUE input
        const valueInput = this.getInput("VALUE");
        if (valueInput) {
            valueInput.setCheck(selectedType);
        }
    }
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

      // 2) Prompt the user for a variable type
      //    (from your existing globalVariableTypesLean array).
      const types = globalVariableTypesLean; 
      const chosenType = selectFromList("Select variable type:", types);
      if (!chosenType) return;

      // 3) Find all generalFunction blocks in the workspace
      //    and gather their user-defined function names for scoping.
      const functionBlocks = workspace.getBlocksByType('generalFunction', false);
      if (!functionBlocks.length) {
          alert("No function blocks found. Please create a 'generalFunction' block first.");
          return;
      }

      // Pull out each function block's 'name' field value
      const functionNames = functionBlocks.map(fnBlock => {
          // The user-sanitized name is stored in the field named 'name'
          // (the default or sanitized text).
          const fnName = fnBlock.getFieldValue('name');
          return fnName || 'UnnamedFunction';
      });

      // Let the user pick which function scope
      const selectedFnName = selectFromList(
          "Select the function where this variable should be scoped:",
          functionNames
      );
      if (!selectedFnName) return;

      // 4) Merge the chosen type with the selected function name
      //    For example: "NUMBER::myFunction"
      const mergedType = `${chosenType}::${selectedFnName}`;

      // 5) Create the variable in the workspace with the merged type
      workspace.createVariable(name, mergedType);
  });

  // Add variable blocks (e.g., variables_get, variables_set) to the category
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
