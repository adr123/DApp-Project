import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
Blockly.defineBlocksWithJsonArray([
    {
    "type": "set_variable",
    "message0": "set %1 to %2",
    "args0": [
        {
        "type": "field_variable",
        "name": "VAR",
        "variable": "variable",
        "variableTypes": [""]
        },
        {
        "type": "input_value",
        "name": "input",
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "",
    "helpUrl": ""
    },
    {
    "type": "print_message",
    "message0": "print %1",
    "args0": [
        {
        "type": "input_value",
        "name": "MESSAGE",
        }
    ],
    previousStatement: null,
    "colour": 230,
    "tooltip": "Prints a message to the console.",
    "helpUrl": ""
    },{
    "type": "messageInformation",
    "message0": "message %1",
    "args0": [
        {
        "type": "field_dropdown",
        "name": "messageData",
        "options": [
            [ "value", "value" ],
            [ "address", "address" ],
            [ "data", "data" ]
        ]
        }
    ],
    "output": null,
    "colour": 230,
    "tooltip": "Data about the object interacting with contract",
    "helpUrl": ""
    },{
    "type": "fallbackFunction",
    "message0": "Fallback Function",
    nextStatement: null,
    "colour": 230,
    "tooltip": "If you your contract gets called for no reason",
    "helpUrl": ""
    },{
    "type": "recievingFunction",
    "message0": "Recieving Function",
    nextStatement: null,
    "colour": 230,
    "tooltip": "If you your contract only gets given money",
    "helpUrl": ""
    },{
    "type": "generalFunction",
    "message0": "General Function\nFunction name is %1",
    args0:[
        {
        "type": "input_value",
        "name": "functionName",
        }
    ],
    nextStatement: null,
    "colour": 230,
    "tooltip": "If you your contract only gets given money",
    "helpUrl": ""
    },{
    "type": "constructorFunction",
    "message0": "Constructor Function",
    nextStatement: null,
    "colour": 230,
    "tooltip": "This function only gets ran once at contract deployment",
    "helpUrl": ""
    }
    
]);

javascriptGenerator.forBlock['print_message'] = function(block) {
    const message = javascriptGenerator.valueToCode(block, 'MESSAGE', javascriptGenerator.ORDER_NONE) || '""';
    const code = `console.log('${message}');\n`;
    return code;
};
javascriptGenerator.forBlock['set_variable'] = function(block) {
    const message = javascriptGenerator.valueToCode(block, 'MESSAGE', javascriptGenerator.ORDER_NONE) || '""';
    const code = `console.log('${message}');\n`;
    return code;
};
javascriptGenerator.forBlock['math_number'] = function(block) {
    const message = block.getFieldValue('NUM'); // Get text input
    return [message, javascriptGenerator.ORDER_ATOMIC]; 
};
javascriptGenerator.forBlock['messageInformation'] = function(block) {
    const message = `msg.${block.getFieldValue('messageData')}`;  // Get child of message
    return [message, javascriptGenerator.ORDER_NONE]; 
};
javascriptGenerator.forBlock['fallbackFunction'] = function() {
    return 'fallback'
};
javascriptGenerator.forBlock['recievingFunction'] = function() {
    return 'reciever'
};
javascriptGenerator.forBlock['constructorFunction'] = function() {
    return 'constructor'
};
javascriptGenerator.forBlock['generalFunction'] = function() {
    return 'general'
};

const toBox = {
    kind: "categoryToolbox",
    contents: [
        {
        "kind": "category",
        "name": "Mine",
        "contents": [
            {kind:"block", type: "fallbackFunction"},
            {kind:"block", type: "recievingFunction"},
            {kind:"block", type: "generalFunction"},
            {kind:"block", type: "constructorFunction"},
            {
            kind: "block",
            type: "controls_if",
            },
            {
            kind: "block",
            type: "controls_whileUntil",
            },
            {
            kind: "block",
            type: "math_number",
            fields: {
                NUM: 2,
            },
            },
            {
            kind: "block",
            type: "string_length",
            },
            {
            kind: "block",
            type: "print_message"
            },{
            kind:"block",   
            type: "messageInformation"
            },
        ]
        },{
            "kind": "category",
            "name": "Logic",
            "contents": [
                { kind: 'block', type: 'logic_boolean' },
                { kind: 'block', type: 'controls_if' },
                { kind: 'block', type: 'controls_ifelse' },
                { kind: 'block', type: 'logic_compare' },
                { kind: 'block', type: 'logic_operation' },
                { kind: 'block', type: 'logic_negate' },
                { kind: 'block', type: 'logic_null' },
                { kind: 'block', type: 'logic_ternary' },
                { kind: 'block', type: 'controls_if_if' },
                { kind: 'block', type: 'controls_if_elseif' },
                { kind: 'block', type: 'controls_if_else' },
            ]
        },{
            "kind": "category",
            "name": "Loop",
            "contents": [
                { kind: 'block', type: 'controls_repeat_ext' },
                { kind: 'block', type: 'controls_repeat' },
                { kind: 'block', type: 'controls_whileUntil' },
                { kind: 'block', type: 'controls_for' },
                { kind: 'block', type: 'controls_forEach' },
                { kind: 'block', type: 'controls_flow_statements' },
            ]
        },{
            "kind": "category",
            "name": "Math",
            "contents": [
                { kind: 'block', type: 'math_number' },
                { kind: 'block', type: 'math_arithmetic' },
                { kind: 'block', type: 'math_single' },
                { kind: 'block', type: 'math_trig' },
                { kind: 'block', type: 'math_constant' },
                { kind: 'block', type: 'math_number_property' },
                { kind: 'block', type: 'math_change' },
                { kind: 'block', type: 'math_round' },
                { kind: 'block', type: 'math_on_list' },
                { kind: 'block', type: 'math_modulo' },
                { kind: 'block', type: 'math_constrain' },
                { kind: 'block', type: 'math_random_int' },
                { kind: 'block', type: 'math_random_float' },
                { kind: 'block', type: 'math_atan2' },
            ]
        }
        
    ],
};

  // Inject Blockly AFTER the DOM element renders
export const workspace = function(){
    const options = {
        toolbox: toBox,
        collapse: false,
        comments: true,
        disable: false,
        maxBlocks: Infinity,
        trashcan: true,
        autoClose: false, // Keep flyout open even when unfocused
    };
    return Blockly.inject("drag-drop",options);
    }

  /*
  return () => {
      // Clean up Blockly workspace when component unmounts
      workspace.dispose();
    };
    */