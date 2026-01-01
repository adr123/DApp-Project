import * as Blockly from "blockly";
export const solidityGenerator = new Blockly.Generator("sol");
import "./renderer.js";

const globalVariableTypes = [
  ["ADDRESS", "ADDRESS"],
  ["NUMBER", "NUMBER"],
  ["STRING", "STRING"],
  ["BOOL", "BOOL"],
  ["WEI", "WEI"],
];
const globalVariableTypesLean = ["ADDRESS", "NUMBER", "STRING", "WEI", "BOOL"]; //address, int256, string, wei, bool

function allChecks(block){
  let checksArray = [];
  globalVariableTypesLean.forEach((s) => {
    checksArray.push(s + "::" + getParentFunctionName(block))
  })
  return checksArray;
}

Blockly.defineBlocksWithJsonArray([
  {
    type: "recievingFunction",
    message0: "Recieving Function",
    nextStatement: ["receivingFunction"],
    colour: 160,
    tooltip: "This function is triggered when ETH is sent to your contract",
    helpUrl: "",
  },
  {
    type: "fallbackFunction",
    message0: "Fallback Function",
    nextStatement: ["fallbackFunction"],
    colour: 160,
    tooltip: "This function is triggered when data is sent to your contract",
    helpUrl: "",
  },
  {
    type: "constructorFunction",
    nextStatement: ["constructorFunction"],
    message0: "Constructor Function",
    colour: 160,
    tooltip:
      "This function is triggered only once when your contract is deployed",
    helpUrl: "",
  },
]);
// ================== HELPER FUNCTIONS ==================

/**
 * Traverse upward from the current block until we find a parent block
 * of type "generalFunction", "recievingFunction", "fallbackFunction", or "constructorFunction".
 * Return the name of that function-like block, or "NoParent" if none found.
 * If it's a generalFunction, we read the field 'name' (the sanitized function name).
 * If it's a fallbackFunction, recievingFunction, or constructorFunction, we just return the block type as the name.
 * @param {Blockly.Block} block
 * @returns {string} The parent's function name or block type, or "NoParent" if none found.
 */
function getParentFunctionName(block) {
  let parent = block.getParent();
  while (parent) {
    const type = parent.type;
    // If the parent is a generalFunction, read its name field
    if (type === "generalFunction") {
      const fnName = parent.getFieldValue("name") || "UnnamedFunction";
      return fnName;
    }
    // If the parent is one of the special function-like blocks
    if (
      type === "fallbackFunction" ||
      type === "recievingFunction" ||
      type === "constructorFunction"
    ) {
      return type;
      // e.g. "fallbackFunction", "recievingFunction", "constructorFunction"
    }
    parent = parent.getParent();
  }
  return "NoParent";
}

/**
 * Given a block and a base type (e.g., "NUMBER"), return a 2-element array:
 * [
 *   "NUMBER",
 *   "NUMBER::theParentName"
 * ]
 * for dynamic checks.
 *
 * @param {Blockly.Block} block - The block needing the checks.
 * @param {string} baseType - The main type this block expects (e.g., "NUMBER", "STRING").
 * @returns {Array<string>} An array with two possible connection checks.
 */
function getDoubleCheck(block, baseType) {
  if (baseType) {
    const parentFnName = getParentFunctionName(block);
    return [baseType, `${baseType}::${parentFnName}`, "any"];
  } else {
    const parentFnName = getParentFunctionName(block);
    return [parentFnName];
  }
}

/*************************************************
 * CUSTOM VARIABLE CATEGORY CALLBACK (UPDATED)
 *************************************************/

function selectFromList(message, options) {
  const selectionPrompt =
    `${message}\n\n` + options.map((opt, i) => `${i + 1}. ${opt}`).join("\n");
  const userInput = prompt(selectionPrompt);
  if (!userInput) return null;

  const selectedIndex = parseInt(userInput, 10) - 1;
  if (
    isNaN(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex >= options.length
  ) {
    alert("Invalid selection. Please try again.");
    return null;
  }
  return options[selectedIndex];
}
function customVariableCategoryCallback(workspace) {
  const xmlList = [];

  // Create a local set or map of variable names for easy duplicate checks
  const allVarNames = new Set();
  // Populate this set with existing variable names in the workspace
  const allVars = workspace.getAllVariables();
  for (const variableModel of allVars) {
    allVarNames.add(variableModel.name);
  }

  // Add a "Create Variable" button
  const button = document.createElement("button");
  button.setAttribute("text", "Create a variable");
  button.setAttribute("callbackKey", "CREATE_CUSTOM_VARIABLE");
  xmlList.push(button);

  // Register the button callback
  workspace.registerButtonCallback("CREATE_CUSTOM_VARIABLE", () => {
    console.log("Custom create variable button triggered");

    let name = prompt("Enter variable name:");
    if (!name) return;

    // 1) Sanitize the variable name: remove invalid chars, replace spaces, etc.
    name = name
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    if (!name) {
      alert("Invalid variable name. Use only alphanumeric characters/underscores.");
      return;
    }

    // 2) Check for duplicates. If a duplicate is found, append a number.
    let originalName = name;
    let counter = 1;
    while (allVarNames.has(name)) {
      name = `${originalName}${counter}`;
      counter++;
    }
    // Now 'name' is guaranteed unique.
    allVarNames.add(name);

    // 3) Prompt the user for a variable type from your global array
    const types = globalVariableTypesLean; 
    const chosenType = selectFromList("Select variable type:", types);
    if (!chosenType) return;

    // 4) Find function-like blocks for scoping
    const gf = workspace.getBlocksByType("generalFunction", false) || [];
    const rec = workspace.getBlocksByType("recievingFunction", false) || [];
    const fb = workspace.getBlocksByType("fallbackFunction", false) || [];
    const cf = workspace.getBlocksByType("constructorFunction", false) || [];

    const functionBlocks = [...gf, ...rec, ...fb, ...cf];

    if (!functionBlocks.length) {
      alert("No function-like blocks found. Please create one first.");
      return;
    }

    // Convert them to strings for prompt
    const functionNames = functionBlocks.map((fnBlock) => {
      if (fnBlock.type === "generalFunction") {
        const fnName = fnBlock.getFieldValue("name");
        return fnName || "UnnamedFunction";
      }
      // If it's recievingFunction, fallbackFunction, or constructorFunction, we can just return the block type or a custom label
      if (fnBlock.type === "recievingFunction") return "Receiving";
      if (fnBlock.type === "fallbackFunction") return "Fallback";
      if (fnBlock.type === "constructorFunction") return "Constructor";
      return "UnknownFnBlock";
    });

    const selectedFn = selectFromList(
      "Select the function where this variable should be scoped:",
      functionNames
    );
    if (!selectedFn) return;

    // 5) Merge the chosen type with the function name
    const mergedType = `${chosenType}::${selectedFn}`;
    // Create the variable
    workspace.createVariable(name, mergedType);
  });

  // Add variable blocks (e.g., variables_get, variables_set) to the category
  const setBlock = Blockly.utils.xml.createElement("block");
  setBlock.setAttribute("type", "variables_set");
  xmlList.push(setBlock);

  const getBlock = Blockly.utils.xml.createElement("block");
  getBlock.setAttribute("type", "variables_get");
  xmlList.push(getBlock);

  return xmlList;
}

// ================== BLOCK DEFINITIONS (FUNCTION BLOCKS LEFT AS IS) ==================
// ==================== Minimal Approach: Directly Block "Resurrecting" a Deleted Variable ====================
// In this approach, whenever we delete a variable, we mark its ID in a special
// blacklist set on the workspace. Then if FieldVariable.initModel later tries
// to resurrect that same variable (by ID), we skip the creation step entirely
// and log an appropriate warning. This ensures that once a variable is
// explicitly deleted, it does not come back.
//
// The key changes below are:
//   1) We add "this.workspace.__bannedVarIds" (a Set) if it doesn't exist.
//   2) Whenever we do "this.workspace.deleteVariableById(...)", we also add
//      that variable's ID to __bannedVarIds.
//   3) In FieldVariable.initModel, if the would-be variable is blacklisted,
//      we skip calling originalInitModel entirely.
//
// That way, the next time "initModel" runs (for instance, if the mutator or
// flyout tries to re-render a block referencing that variable ID), we do
// nothing, preventing the deleted variable from reappearing.

Blockly.Blocks["generalFunction_item"] = {
  init: function () {
    this.setStyle("procedure_blocks");
    this.appendDummyInput().appendField("Parameter");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(160);
    this.contextMenu = false;
  },
};

Blockly.Blocks["generalFunction_container"] = {
  init: function () {
    this.setStyle("procedure_blocks");
    this.appendDummyInput().appendField("Inputs");
    this.appendStatementInput("STACK");
    this.setColour(160);
    this.contextMenu = false;
  },
};

// ---------------------------------------------------------------------
// PART 1: Override "deleteVariableById" to also store banned IDs in a Set
// ---------------------------------------------------------------------
if (!Blockly.Workspace.prototype.__bannedVarIds) {
  Blockly.Workspace.prototype.__bannedVarIds = new Set();
}

const originalDeleteVariableById =
  Blockly.Workspace.prototype.deleteVariableById;
Blockly.Workspace.prototype.deleteVariableById = function (id) {
  const variable = this.getVariableById(id);
  if (variable) {
    const varId = variable.getId(); // definitely the ID
    console.warn(
      `[Workspace] Deleting variable: name="${variable.name}", ` +
      `type="${variable.type}", ID="${varId}"`
    );
    // Add to the banned set so if something tries to resurrect it, we skip
    this.__bannedVarIds.add(varId);
  } else {
    console.warn(`[Workspace] deleteVariableById called on unknown ID="${id}"`);
  }
  return originalDeleteVariableById.call(this, id);
};

// ---------------------------------------------------------------------
// PART 2: Keep existing logs for createVariable so we can see the calls
// ---------------------------------------------------------------------
const originalCreateVariable = Blockly.Workspace.prototype.createVariable;
Blockly.Workspace.prototype.createVariable = function (name, type, id) {
  console.warn(`GLOBAL: createVariable called with name=${name}, type=${type}, id=${id}`);
  console.trace("Stack trace for createVariable call");
  return originalCreateVariable.call(this, name, type, id);
};

// ---------------------------------------------------------------------
// PART 3: Modify initModel to skip creation if the ID is blacklisted
// ---------------------------------------------------------------------
const originalInitModel = Blockly.FieldVariable.prototype.initModel;
Blockly.FieldVariable.prototype.initModel = function () {
  const block = this.getSourceBlock();
  if (!block) throw new Error("Unattached FieldVariable in initModel.");

  if (this.variable) {
    // Already have a variable, just re-use it.
    console.log(
      `FieldVariable initModel: reusing existing variable name="${this.variable.name}" ` +
      `ID="${this.variable.getId()}"`
    );
    return;
  }

  console.warn(
    "FieldVariable initModel: No existing variable => going to create or look up one."
  );
  console.trace("Stack trace for FieldVariable initModel call");

  // Let the original code actually set this.variable
  originalInitModel.call(this);

  if (!this.variable) {
    // If still null for some reason, there's nothing to ban-check anyway
    return;
  }

  // Now see if the ID is in the banned set:
  const newId = this.variable.getId(); // the real ID for this variable
  const bannedSet = block.workspace.__bannedVarIds;
  console.log(
    `FieldVariable initModel: newly associated var name="${this.variable.name}" ID="${newId}"`,
    "banned set =>",
    bannedSet
  );

  if (bannedSet && bannedSet.has(newId)) {
    // We see that ID was previously deleted -> forcibly remove so we don't resurrect it
    console.warn(
      `FieldVariable initModel: ID="${newId}" is banned => forcibly removing variable reference.`
    );
    this.variable = null; // Clears the reference so we don't keep using it
    // Optionally call this.setValue(null) if you want the UI to show "no variable"
    // this.setValue(null);
  }
};
//pot maps potmaps potential
const oldDeleteVarById = Blockly.Workspace.prototype.deleteVariableById;
Blockly.Workspace.prototype.deleteVariableById = function (id) {
  // 1. Delete from the main map as before.
  const mainVar = this.getVariableById(id);
  if (mainVar) {
    console.warn(`[Workspace] Deleting from main map => ID="${id}"`);
  }
  oldDeleteVarById.call(this, id);

  // 2. Also delete from the potential map if it’s around.
  const potMap = this.getPotentialVariableMap();
  if (potMap) {
    const potVar = potMap.getVariableById(id);
    if (potVar) {
      console.warn(`[Workspace] Also deleting from potential map => ID="${id}"`);
      potMap.deleteVariableById(id);
    }
  }
};
//find this fucker

const oldGetOrCreateVarPkg = Blockly.Variables.getOrCreateVariablePackage;
Blockly.Variables.getOrCreateVariablePackage = function (
  workspace,
  id,
  opt_name,
  opt_type
) {
  // Extra debugging info:
  console.warn(
    "%c[DEBUG] getOrCreateVariablePackage called:",
    "color: fuchsia; font-weight: bold;",
    {
      workspaceId: workspace.id,
      id: id || "<no ID>",
      name: opt_name || "<no name>",
      type: opt_type || "<no type>",
    }
  );
  console.trace("Stack trace for getOrCreateVariablePackage");

  // Now call the original function
  const variable = oldGetOrCreateVarPkg.call(
    this,
    workspace,
    id,
    opt_name,
    opt_type
  );

  // After creation or retrieval:
  if (variable) {
    console.warn(
      "[DEBUG] getOrCreateVariablePackage => returning variable with ID=",
      variable.getId(),
      " name=" + variable.name,
      " type=" + variable.type
    );
  } else {
    console.warn("[DEBUG] => returned null/undefined");
  }

  return variable;
};
//find this fucker again

const oldCreateVariable = Blockly.Workspace.prototype.createVariable;
Blockly.Workspace.prototype.createVariable = function (name, type, id) {
  console.warn(
    "%c[DEBUG] createVariable called:",
    "color: magenta; font-weight: bold;",
    {
      workspaceId: this.id,
      name,
      type,
      id: id || "<none>",
    }
  );
  console.trace("Stack trace for createVariable");
  
  const variable = oldCreateVariable.call(this, name, type, id);

  if (variable) {
    console.warn(
      "[DEBUG] createVariable => returning var ID=",
      variable.getId(),
      " name=" + variable.name,
      " type=" + variable.type
    );
  } else {
    console.warn("[DEBUG] createVariable => returned null?");
  }
  return variable;
};
//this motherufcker
// 1) Xml.domToBlockInternal
const oldDomToBlock = Blockly.Xml.domToBlockInternal;
Blockly.Xml.domToBlockInternal = function (xmlBlock, workspace) {
  console.warn(
    "%c[DEBUG] Xml.domToBlockInternal called",
    "color:green;font-weight:bold;",
    {xmlBlock, workspaceId: workspace.id}
  );
  console.trace("[DEBUG] Stack trace for Xml.domToBlockInternal");
  const block = oldDomToBlock.call(this, xmlBlock, workspace);
  console.warn(
    "[DEBUG] Xml.domToBlockInternal => created block ID:",
    block?.id,
    " type:",
    block?.type
  );
  return block;
};

// 2) The new JSON-based approach: serialization.blocks
if (Blockly.serialization?.blocks?.appendInternal) {
  const oldAppendInternal = Blockly.serialization.blocks.appendInternal;
  Blockly.serialization.blocks.appendInternal = function (state, workspace, options) {
    console.warn(
      "%c[DEBUG] blocks.appendInternal called",
      "color:green;font-weight:bold;",
      {state, workspaceId: workspace.id, options}
    );
    console.trace("[DEBUG] Stack trace for blocks.appendInternal");
    const result = oldAppendInternal.call(this, state, workspace, options);
    console.warn("[DEBUG] blocks.appendInternal => created block(s) =>", result);
    return result;
  };
}

//wherei s he :(
  const oldCreateFlyoutBlock = Blockly.Flyout.prototype["createFlyoutBlock"];
  if (oldCreateFlyoutBlock) {
    Blockly.Flyout.prototype.createFlyoutBlock = function (info) {
      console.warn(
        "%c[DEBUG] Flyout createFlyoutBlock called",
        "color:blue;font-weight:bold;",
        info
      );
      console.trace("[DEBUG] stack trace createFlyoutBlock");
      const block = oldCreateFlyoutBlock.call(this, info);
      console.warn("[DEBUG] => Created block ID:", block?.id, "type:", block?.type);
      return block;
    };
  }
// ---------------------------------------------------------------------
// The generalFunctionMutator: same as before, but we add a line to ban ID
// as soon as we decide to delete it, so it never resurrects
// ---------------------------------------------------------------------
const generalFunctionMutator = {
  saveExtraState: function () {
    return this.paramCount_ < 1 ? null : { paramCount: this.paramCount_ };
  },
  loadExtraState: function (state) {
    if (state && typeof state.paramCount === "number") {
      this.paramCount_ = state.paramCount;
      this.updateShape_();
    }
  },
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("param_count", this.paramCount_);
    return container;
  },
  domToMutation: function (xmlElement) {
    this.paramCount_ = parseInt(xmlElement.getAttribute("param_count") || "0", 10);
    this.updateShape_();
  },

  decompose: function (workspace) {
    console.log("Decompose called. Current paramCount:", this.paramCount_);

    // 1) Figure out which variable IDs are actually selected in our parameter fields
    const selectedVariableIds = new Set();
    for (let i = 0; i < this.paramCount_; i++) {
      const fieldName = "PARAM" + i + "_FIELD";
      const fieldVar = this.getField(fieldName);
      if (fieldVar && typeof fieldVar.getVariable === "function") {
        const theVar = fieldVar.getVariable();
        if (theVar) {
          selectedVariableIds.add(theVar.getId());
        }
      }
    }

    // 2) Gather all variables typed to this function's type (STRING::<fnName>)
    const fnName = this.getFieldValue("name") || "Unnamed";
    const paramType = "STRING::" + fnName;
    const typedVars = this.workspace.getAllVariables().filter(
      (v) => v.type === paramType
    );

    // 3) Group them by name
    const nameToVarsMap = {};
    typedVars.forEach((v) => {
      if (!nameToVarsMap[v.name]) {
        nameToVarsMap[v.name] = [];
      }
      nameToVarsMap[v.name].push(v);
    });

    // 4) For each name group, keep only the used or first. Delete rest.
    for (const name in nameToVarsMap) {
      const arrayOfVars = nameToVarsMap[name];
      if (arrayOfVars.length > 1) {
        const inUseVars = arrayOfVars.filter((v) =>
          selectedVariableIds.has(v.getId())
        );
        let keeper;
        if (inUseVars.length > 0) {
          keeper = inUseVars[0];
        } else {
          keeper = arrayOfVars[0];
        }
        for (const dupe of arrayOfVars) {
          if (dupe.getId() !== keeper.getId()) {
            console.warn(
              `Deleting duplicate variable: name=${dupe.name}, type=${dupe.type}, id=${dupe.getId()}`
            );
            // This calls our patched deleteVariableById,
            // which adds the ID to the banned list
            //this.workspace.deleteVariableById(dupe.getId());
          }
        }
      }
    }

    // Proceed with building the container block
    const containerBlock = workspace.newBlock("generalFunction_container");
    containerBlock.initSvg();
    let connection = containerBlock.getInput("STACK").connection;
    for (let i = 0; i < this.paramCount_; i++) {
      const itemBlock = workspace.newBlock("generalFunction_item");
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },

  compose: function (containerBlock) {
    console.log("Compose called. Rebuilding parameters...");
    let itemBlock = containerBlock.getInputTargetBlock("STACK");
    let count = 0;
    while (itemBlock) {
      count++;
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    this.paramCount_ = count;
    console.log("Final param count after compose:", this.paramCount_);
    this.updateShape_();
  },

  updateShape_: function () {
    console.log("Updating shape. Current paramCount:", this.paramCount_);

    let i = 0;
    while (this.getInput("PARAM" + i)) {
      this.removeInput("PARAM" + i);
      i++;
    }

    const fnName = this.getFieldValue("name") || "Unnamed";
    const paramType = "STRING::" + fnName;

    for (let j = 0; j < this.paramCount_; j++) {
      const defaultVarName = "input" + j;
      let existingVar = this.workspace.getAllVariables().find(
        (v) => v.name === defaultVarName && v.type === paramType
      );

      if (!existingVar) {
        console.warn(`Creating missing variable ${defaultVarName} of type ${paramType}`);
        existingVar = this.workspace.createVariable(defaultVarName, paramType);
      }

      const input = this.appendDummyInput("PARAM" + j).setAlign(Blockly.ALIGN_RIGHT);
      input.appendField("Parameter " + (j + 1));

      const varField = new Blockly.FieldVariable(
        existingVar.name,
        null,
        [paramType],
        paramType
      );
      input.appendField(varField, "PARAM" + j + "_FIELD");
    }

    console.log("All variables after updateShape_:", this.workspace.getAllVariables());
    //this.cleanupDuplicates_();
  },

  cleanupDuplicates_: function () {
    const fnName = this.getFieldValue("name") || "Unnamed";
    const paramType = "STRING::" + fnName;
    const allVars = this.workspace.getAllVariables();

    const usedIds = [];
    for (let j = 0; j < this.paramCount_; j++) {
      const fieldName = "PARAM" + j + "_FIELD";
      const field = this.getField(fieldName);
      if (field && field.getVariable) {
        const fieldVar = field.getVariable();
        if (fieldVar) {
          usedIds.push(fieldVar.getId());
        }
      }
    }

    const groupedByName = {};
    for (const v of allVars) {
      if (v.type === paramType) {
        if (!groupedByName[v.name]) groupedByName[v.name] = [];
        groupedByName[v.name].push(v);
      }
    }

    for (const name in groupedByName) {
      const varsWithName = groupedByName[name];
      if (varsWithName.length > 1) {
        varsWithName.forEach((variable) => {
          if (!usedIds.includes(variable.getId())) {
            console.warn(
              `Deleting duplicate variable: name=${variable.name},` +
              ` type=${variable.type}, ID=${variable.getId()}`
            );
            // This calls our patched deleteVariableById
            this.workspace.deleteVariableById(variable.getId());
          }
        });
      }
    }
  },
};

// And finally, define/extend the "generalFunction" block type:
Blockly.Blocks["generalFunction"] = {
  init: function () {
    this.jsonInit({
      type: "generalFunction",
      message0: "Function called %1",
      args0: [{ type: "field_input", name: "name", text: "defaultFn" }],
      message1: "only callable %1",
      args1: [
        {
          type: "field_dropdown",
          name: "operator",
          options: [
            ["by anybody", "by anybody"],
            ["internally", "internally"],
            ["by owner", "by owner"],
          ],
        },
      ],
      message2: "Inputs",
      nextStatement: null,
      colour: 160,
      tooltip: "A general function with a param mutator",
      mutator: "generalFunction_mutator",
    });
    this.paramCount_ = 0;
    const nameField = this.getField("name");
    nameField.setValidator(this.validateFnName_.bind(this));
    const initialName = nameField.getValue() || "defaultFn";
    this.setNextStatement(true, initialName);
  },

  validateFnName_: function (newVal) {
    const oldName = this.getFieldValue("name") || "";
    let sanitized = newVal.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    if (!/^[a-zA-Z_]/.test(sanitized)) sanitized = "_" + sanitized;
    if (!sanitized) sanitized = "_fn";

    const ws = this.workspace;
    if (!ws) return sanitized;

    const gfBlocks = ws.getBlocksByType("generalFunction", false);
    let finalName = sanitized;
    let counter = 1;

    while (true) {
      let conflict = false;
      for (const b of gfBlocks) {
        if (b.id === this.id) continue;
        if ((b.getFieldValue("name") || "") === finalName) {
          conflict = true;
          break;
        }
      }
      if (!conflict) break;
      finalName = sanitized + counter;
      counter++;
    }

    // For any old variables named with the old function name,
    // rename them to the new function name:
    const allVariables = ws.getAllVariables();
    const affectedVariables = allVariables.filter(
      (variable) => variable.type.endsWith(`::${oldName}`)
    );
    affectedVariables.forEach((variable) => {
      const newType = variable.type.replace(`::${oldName}`, `::${finalName}`);
      variable.type = newType;
    });

    // Nothing fancy here, we just rename variable types in place.
    setTimeout(() => {
      this.setNextStatement(true, finalName);
    }, 30);

    return finalName;
  },
};

// Register the mutator
Blockly.Extensions.registerMutator(
  "generalFunction_mutator",
  generalFunctionMutator,
  null,
  ["generalFunction_item"]
);

// ========== Now convert each non-function block to a dynamic JS block with 2 checks ==========

Blockly.Blocks["contractOwner"] = {
  init: function () {
    // This block outputs an ADDRESS by default
    // We'll do .setOutput(true, [ADDRESS, ADDRESS::PARENT_FUNCTION])
    const checks = getDoubleCheck(this, "ADDRESS");
    this.appendDummyInput()
      .appendField("This contract address")
      .appendField(new Blockly.FieldLabelSerializable(""), "value"); // preserve the old input_dummy name
    this.setOutput(true, checks);
    this.setColour(160);
    this.setTooltip("This is the contract's owner address");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["addressInformation"] = {
  init: function () {
    // original: input_value with check: ADDRESS -> now it's 2 checks
    const addressChecks = getDoubleCheck(this, "ADDRESS");
    const numberChecks = getDoubleCheck(this, "NUMBER");
    this.appendValueInput("addressData")
      .setCheck(addressChecks)
      .appendField("Balance of");
    this.setOutput(true, numberChecks);
    this.setColour(230);
    this.setTooltip("Balance of ether on address");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["userString"] = {
  init: function () {
    // original: output = STRING
    const stringChecks = getDoubleCheck(this, "STRING");
    this.appendDummyInput().appendField(new Blockly.FieldTextInput(""), "data");
    this.setOutput(true, stringChecks);
    this.setColour(230);
    this.setTooltip("Input your string");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["messageInformation"] = {
  init: function () {
    // We'll store the user-chosen field in a dropdown: either => "value" => NUMBER, "address" => ADDRESS
    // Then we do dynamic checks for output
    this.appendDummyInput("DUMMY")
      .appendField("message")
      .appendField(
        new Blockly.FieldDropdown(
          [
            ["value", "value"],
            ["address", "address"],
            ["data", "data"],
          ],
          this.updateOutputType.bind(this)
        ),
        "messageData"
      );
    // We'll do default to NUMBER or something
    this.setOutput(true, "NUMBER");
    this.setColour(230);
    this.setTooltip("Data about the object interacting with the contract");
    this.setHelpUrl("");
  },
  updateOutputType: function (newVal) {
    // newVal is 'value', 'address', or 'data'
    let baseType = "NUMBER"; // default
    if (newVal === "address") {
      baseType = "ADDRESS";
    }
    // If it's 'data', you might do something else, but let's keep it as a string or whatever you want.
    if (newVal === "data") {
      baseType = "STRING"; // example
    }
    const checks = getDoubleCheck(this, baseType);
    this.setOutput(true, checks);
  },
};

Blockly.Blocks["blockInformation"] = {
  init: function () {
    this.appendDummyInput("DUMMY")
      .appendField("block")
      .appendField(
        new Blockly.FieldDropdown(
          [
            ["timestamp", "timestamp"],
            ["number", "number"],
            ["difficulty", "difficulty"],
            ["gaslimit", "gaslimit"],
            ["basefee", "basefee"],
          ],
          this.updateOutputType.bind(this)
        ),
        "messageData"
      );
    // default to NUMBER
    const initChecks = getDoubleCheck(this, "NUMBER");
    this.setOutput(true, initChecks);
    this.setColour(230);
    this.setTooltip("Data about/from the current block");
    this.setHelpUrl("");
  },
  updateOutputType: function () {
    // e.g. 'timestamp' => NUMBER, 'number' => NUMBER, 'difficulty' => NUMBER...
    // Actually they're all numeric in reality, but you might do special cases
    let baseType = "NUMBER";
    // If for some reason you want e.g. timestamp => some other type, do that
    // We'll keep them all as NUMBER for simplicity
    const checks = getDoubleCheck(this, baseType);
    this.setOutput(true, checks);
  },
};

// ================== CONTROL BLOCKS (dynamic) ==================

Blockly.Blocks["ifelse"] = {
  init: function () {
    // We'll treat the condition as BOOL
    const boolChecks = getDoubleCheck(this, "BOOL");
    this.appendValueInput("COND").setCheck(boolChecks).appendField("if");
    this.appendStatementInput("IF").appendField("do");
    this.appendStatementInput("ELSE").appendField("else");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip(
      "If condition is true, do statements; else, do other statements."
    );
    this.setHelpUrl("");
  },
};

Blockly.Blocks["require"] = {
  init: function () {
    const boolChecks = getDoubleCheck(this, "BOOL");
    const stringChecks = getDoubleCheck(this, "STRING");
    this.appendValueInput("requisite")
      .setCheck(boolChecks)
      .appendField("require");
    this.appendValueInput("errorMessage")
      .setCheck(stringChecks)
      .appendField("error message");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("If this statement fails, terminates contract");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["while"] = {
  init: function () {
    const boolChecks = getDoubleCheck(this, "BOOL");
    this.appendValueInput("stat").setCheck(boolChecks).appendField("while");
    this.appendStatementInput("while").appendField("do");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("While this is true, run this code");
    this.setHelpUrl("");
  },
};

// ================== ACTIONS & LOGIC (dynamic) ==================

Blockly.Blocks["sendEth"] = {
  init: function () {
    this.appendValueInput("AMOUNT").setCheck(null).appendField("Send");
    this.appendValueInput("RECIPIENT").setCheck(null).appendField("ether to");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Send ether to *address*");
    this.setHelpUrl("");

    // Add onchange listener
    this.setOnChange(this.updateChecks.bind(this));
  },

  /**
   * Updates the checks for the next statement and the input connections.
   */
  updateChecks: function () {
    const numberChecks = getDoubleCheck(this, "NUMBER");
    const addressChecks = getDoubleCheck(this, "ADDRESS");
    const parent = this.getParent();

    // Update the next statement check
    if (parent) {
      this.setNextStatement(true, getDoubleCheck(this));
      this.getInput("AMOUNT").setCheck(numberChecks);
      this.getInput("RECIPIENT").setCheck(addressChecks);
    } else {
      this.setNextStatement(true, null); // Reset if detached
      this.getInput("AMOUNT").setCheck("NUMBER");
      this.getInput("RECIPIENT").setCheck("ADDRESS");
    }
  },
};


Blockly.Blocks["emit"] = {
  init: function () {
    this.appendValueInput("data")
      .setCheck(null)
      .appendField("Emit notification");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Data about the object interacting with contract");
    this.setHelpUrl("");
    // Add onchange listener
    this.setOnChange(this.updateNextStatementCheck.bind(this));
  },

  /**
   * Updates the next statement check based on the parent block.
   */
  updateNextStatementCheck: function () {
    const parent = this.getParent();
    if (parent) {
      this.setNextStatement(true, getDoubleCheck(this));
      this.getInput("data").setCheck(allChecks(this));
    } else {
      this.setNextStatement(true, null); // Reset if detached
      this.getInput("data").setCheck(null);
    }
  },
};

Blockly.Blocks["return"] = {
  init: function () {
    // This block had no explicit type constraints. We'll keep it flexible:
    // If you want to allow e.g. returning a NUMBER or NUMBER::fn,
    // you could do something like getDoubleCheck(this, 'ANY'),
    // but "ANY" doesn't exist. We'll keep .setCheck(null).
    this.appendValueInput("data").setCheck(null).appendField("return");
    this.setPreviousStatement(true, null);
    this.setColour(230);
    this.setTooltip(
      "Return this information to the person who called the function"
    );
    this.setHelpUrl("");
    // Add onchange listener
    this.setOnChange(this.updateNextStatementCheck.bind(this));
  },

  /**
   * Updates the next statement check based on the parent block.
   */
  logParentVariableType: function () {
    const parentBlock = this.getParent();
    const ws = this.workspace;
    if (!ws) {
      console.warn("No workspace found for block:", this);
      return;
    }else{
      const allWs = Blockly.Workspace.getAll();
      console.log("All known workspaces:", allWs);

      allWs.forEach((ws, i) => {
        const vars = ws.getAllVariables();
        console.log(`Workspace #${i} (id=${ws.id}) has variables:`, vars);
      });
    
    }
    if (!parentBlock) {
      console.log("No parent block connected.");
      return;
    }
    
    // First, log the parent block's 'VAR' field if it exists:
    const variableField = parentBlock.getField("VAR");
    if (!variableField) {
      console.log("No variable field found in the parent block.");
    } else {
      const selectedVariable = variableField.getVariable();
      if (!selectedVariable) {
        console.log("No variable selected in the parent block's 'VAR' field.");
      } else {
        console.log(
          `Selected variable: Name=${selectedVariable.name}, Type=${selectedVariable.type}, ID=${selectedVariable.getId()}`
        );
      }
    }
  
    // Next, if the parent block has a mutator with parameter fields, log those too:
    if (
      parentBlock.type === "generalFunction" &&
      typeof parentBlock.paramCount_ === "number"
    ) {
      for (let i = 0; i < parentBlock.paramCount_; i++) {
        const fieldName = "PARAM" + i + "_FIELD";
        const field = parentBlock.getField(fieldName);
        if (field && field.getVariable) {
          const paramVar = field.getVariable();
          if (paramVar) {
            console.log(
              `Param #${i}: name=${paramVar.name}, type=${paramVar.type}, ID=${paramVar.getId()}`
            );
          } else {
            console.log(`Param #${i} has no associated variable.`);
          }
        } else {
          console.log(`No FieldVariable found for PARAM${i} on the parent block.`);
        }
      }
    } else {
      console.log("No generalFunction mutator parameters found on the parent block.");
    }
  },
  

  updateNextStatementCheck: function () {
    this.logParentVariableType()
    const parent = this.getParent();
    if (parent) { 
      this.getInput("data").setCheck(allChecks(this));
      console.log('Next check of parent block: ',this.getParent()?.nextConnection?.getCheck());
    } else {
      this.getInput("data").setCheck(null);
    }
  },
};


Blockly.Blocks["arithmetic"] = {
  init: function () {
    const numberChecks = getDoubleCheck(this, "NUMBER");
    this.appendValueInput("one").setCheck(numberChecks).appendField("");
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["+", "+"],
        ["-", "-"],
        ["*", "*"],
        ["/", "/"],
        ["%", "%"],
      ]),
      "operator"
    );
    this.appendValueInput("two").setCheck(numberChecks).appendField("");
    this.setInputsInline(true);
    this.setOutput(true, numberChecks);
    this.setColour(60);
    this.setTooltip("Perform arithmetic operations with numbers.");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["checkCompare"] = {
  init: function () {
    const numberChecks = getDoubleCheck(this, "NUMBER");
    const boolChecks = getDoubleCheck(this, "BOOL");
    this.appendValueInput("one").setCheck(numberChecks).appendField("is");
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        [">", ">"],
        ["<", "<"],
        [">=", ">="],
        ["<=", "<="],
        ["=", "="],
        ["!=", "!="],
      ]),
      "comparator"
    );
    this.appendValueInput("two").setCheck(numberChecks);
    this.setOutput(true, boolChecks);
    this.setColour(60);
    this.setTooltip("Compare two values => returns BOOL");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["conjoiners"] = {
  init: function () {
    const boolChecks = getDoubleCheck(this, "BOOL");
    this.appendValueInput("one").setCheck(boolChecks).appendField("");
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["AND", "AND"],
        ["OR", "OR"],
      ]),
      "operator"
    );
    this.appendValueInput("two").setCheck(boolChecks).appendField("");
    this.setOutput(true, boolChecks);
    this.setColour(60);
    this.setTooltip("Join together booleans with AND/OR");
    this.setHelpUrl("");
  },
};


Blockly.Blocks["string_join"] = {
  init: function () {
    // For pure strings:
    const stringChecks = getDoubleCheck(this, "STRING");
    this.appendValueInput("one").setCheck(stringChecks).appendField("");
    this.appendDummyInput().appendField("+");
    this.appendValueInput("two").setCheck(stringChecks).appendField("");
    this.setInputsInline(true);
    this.setOutput(true, stringChecks);
    this.setColour(160);
    this.setTooltip("Join strings into a single string.");
    this.setHelpUrl("");
  },
};

// ================== convertTo block (dynamic but simpler) ==================
Blockly.Blocks["convertTo"] = {
  init: function () {
    // The original code had a dynamic approach. We'll keep a basic structure
    this.appendValueInput("ONE").appendField("Convert");
    this.appendDummyInput()
      .appendField("to")
      .appendField(new Blockly.FieldDropdown(globalVariableTypes), "TYPE");
    this.setColour(20);
    this.setTooltip("Convert from one type to another.");
    this.setHelpUrl("");
    this.setOutput(true);
    this.setOnChange(this.updateConversion.bind(this));
  },
  updateConversion: function () {
    if (!this.workspace) return;
    // We'll keep your existing logic or do nothing special
  },
};

Blockly.Blocks["variables_get"] = {
  init: function () {
    // Create the variable dropdown field with a default variable named 'owner'
    this.appendDummyInput().appendField(
      new Blockly.FieldVariable(
        "owner", // Default variable name
        null, // Validator
        null, // Allowed variable types
        "ADDRESS::constructorFunction" // Default type for this variable
      ),
      "VAR"
    );

    // Initially set the output to null, which we'll override onChange
    this.setOutput(true, null);
    this.setColour(330);
    this.setTooltip("Returns the value of a variable.");
    this.setHelpUrl("");

    // Attach an onchange handler to keep the block's output type in sync
    this.setOnChange(this.updateOutputType.bind(this));
  },

  /**
   * Updates the output connection check based on the selected variable's type.
   * @param {Blockly.Events.Abstract} event A Blockly event.
   */
  updateOutputType: function () {
    // Safety checks: If the workspace or the field doesn't exist, do nothing.
    if (!this.workspace) return;
    const variableField = this.getField("VAR");
    if (!variableField) return;

    // Retrieve the selected variable
    const selectedVariable = variableField.getVariable();
    if (!selectedVariable) return;

    // The variable's type is stored in selectedVariable.type
    const varType = selectedVariable.type || null;
    const outputCheckType = this.outputConnection && this.outputConnection.getCheck();
    // Dynamically set this block's output type to the variable's type
    this.setOutput(true, varType);
    if (1===1)
      console.log("Variable get outputCheck: " + outputCheckType
    );
  },
};

Blockly.Blocks["variables_set"] = {
  init: function () {
    // Dropdown for selecting a variable
    this.appendValueInput("VALUE")
      .appendField("set")
      .appendField(
        new Blockly.FieldVariable(
          "owner",
          null,
          null,
          "ADDRESS::constructorFunction"
        ),
        "VAR"
      ) // Default variable type is ADDRESS::constructorFunction
      .appendField("to");

    // Initially, allow any previous statement by setting type to null
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("Assigns a value to a variable.");
  },

  
  onchange: function () {
    // Ensure the block is still connected to a workspace
    if (!this.workspace) return;

    // Get the selected variable's dropdown field
    const variableDropdown = this.getField("VAR");
    if (!variableDropdown) return;

    // Retrieve the selected variable's details
    const selectedVariable = variableDropdown.getVariable();
    if (!selectedVariable) {
      console.warn("No variable selected.");
      return;
    }

    // Extract variable types and parent function name
    const variableTypes = Array.isArray(selectedVariable.type)
      ? selectedVariable.type
      : [selectedVariable.type];
    const parentFnName = variableTypes
      .map((type) => (type.includes("::") ? type.split("::")[1] : null))
      .find((name) => name) || "noParent";

    // Collect all valid checks
    const checks = variableTypes.reduce((acc, type) => {
      const [baseType, fnName] = type.split("::");
      acc.push(baseType); // Add base type (e.g., ADDRESS)
      if (fnName) {
        acc.push(`${baseType}::${fnName}`); // Add combined type
        acc.push(`any::${fnName}`); // Add "any" version
      }
      return acc;
    }, []);

    // Update the check type for the VALUE input based on the variable's types
    const valueInput = this.getInput("VALUE");
    if (valueInput) {
      valueInput.setCheck(checks);
    }

    // Dynamically set the previousStatement's type to the combined type
    this.setPreviousStatement(true, parentFnName);
    this.setNextStatement(true, parentFnName);
    if (this.getParent()) {
      console.log(
        "Variable set parent next check: " +
          this.getParent().nextConnection.getCheck()
      );
    }

    // Optionally, you might want to update the block's connections or validate existing connections
    // Blockly.Events.disable();
    // this.moveConnections_();
    // Blockly.Events.enable();
  },
};

// ================== Export the workspace function ==================

export const workspace = function () {
  const toBox = {
    kind: "categoryToolbox",
    contents: [
      {
        kind: "category",
        name: "Headers",
        contents: [
          { kind: "block", type: "constructorFunction" },
          { kind: "block", type: "recievingFunction" },
          { kind: "block", type: "fallbackFunction" },
          { kind: "block", type: "generalFunction" },
        ],
      },
      {
        kind: "category",
        name: "Information",
        contents: [
          { kind: "block", type: "messageInformation" },
          { kind: "block", type: "blockInformation" },
          { kind: "block", type: "contractOwner" },
          { kind: "block", type: "addressInformation" },
        ],
      },
      {
        kind: "category",
        name: "Control",
        contents: [
          { kind: "block", type: "ifelse" },
          { kind: "block", type: "require" },
          { kind: "block", type: "while" },
        ],
      },
      {
        kind: "category",
        name: "Logic",
        contents: [
          { kind: "block", type: "checkCompare" },
          { kind: "block", type: "arithmetic" },
          { kind: "block", type: "conjoiners" },
          { kind: "block", type: "string_join" },
        ],
      },
      {
        kind: "category",
        name: "Actions",
        contents: [
          { kind: "block", type: "emit" },
          { kind: "block", type: "sendEth" },
          { kind: "block", type: "return" },
        ],
      },
      {
        kind: "category",
        name: "Other",
        contents: [
          { kind: "block", type: "userString" },
          { kind: "block", type: "convertTo" },
        ],
      },
      {
        kind: "category",
        name: "Variables",
        custom: "VARIABLE",
      },
    ],
  };

  const options = {
    toolbox: toBox,
    collapse: false,
    comments: true,
    disable: false,
    maxBlocks: Infinity,
    trashcan: false,
    autoClose: false,
    renderer: "SmartBlocks",
  };
  const workingSpace = Blockly.inject("drag-drop", options);
  workingSpace.registerToolboxCategoryCallback(
    "VARIABLE",
    customVariableCategoryCallback
  );
  return workingSpace;
};

// ================== Keep Predefined Variables creation ==================
Blockly.WorkspaceSvg.prototype.createPredefinedVariables = function () {
  const predefinedVariables = [
    { name: "owner", type: "ADDRESS::constructorFunction" },
  ];

  predefinedVariables.forEach((variable) => {
    this.createVariable(variable.name, variable.type);
  });
};

// ========== Done! No code generators included as you requested. =========
