/*

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BlocklyWorkspace } from "react-blockly";
import * as Blockly from "blockly";

const toolboxConfiguration = {
  kind: "flyoutToolbox",
  contents: [
    { kind: "block", type: "controls_if" },
    { kind: "block", type: "logic_compare" },
    { kind: "block", type: "text" },
    { kind: "block", type: "text_print" },
    { kind: "block", type: "variables_get" },
    { kind: "block", type: "variables_set" }
  ]
};

export default function Block() {
  const [xml, setXml] = useState("");
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);
  const navigate = useNavigate();

  const handleProcessBlocks = async () => {
    if (!workspace) {
      console.error("Workspace not ready");
      return;
    }

    try {
      const workspaceJson = Blockly.serialization.workspaces.save(workspace);

      const response = await fetch("http://127.0.0.1:8000/process-blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workspace: workspaceJson
        })
      });

      if (!response.ok) {
        throw new Error("Failed to process blocks");
      }

      const data = await response.json();

      navigate("/backtests", {
        state: { result: data }
      });
    } catch (error) {
      console.error("Error sending blocks:", error);
    }
  };

  return (
    <div style={{ width: "100%", padding: "16px" }}>
      <h1>Blocks</h1>

      <button onClick={handleProcessBlocks}>Process Blocks</button>

      <div style={{ marginTop: "16px" }}>
        <BlocklyWorkspace
          className="blockly-workspace"
          toolboxConfiguration={toolboxConfiguration}
          initialXml={xml}
          workspaceConfiguration={{
            grid: {
              spacing: 20,
              length: 3,
              colour: "#ccc",
              snap: true
            }
          }}
          onXmlChange={setXml}
          onInject={(ws) => setWorkspace(ws)}
        />
      </div>
    </div>
  );
}
*/


import { useState } from "react";
import { BlocklyWorkspace } from "react-blockly";
import { javascriptGenerator } from "blockly/javascript";

export default function Block() {
  const [xml, setXml] = useState("");
  const [workspace, setWorkspace] = useState<any>(null);

  const runCode = () => {
    if (!workspace) return;

    const code = javascriptGenerator.workspaceToCode(workspace);
    console.log("Generated code:\n", code);

    try {
      eval(code); // simple execution
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ width: "100%", padding: "16px" }}>
      <h1>Blocks</h1>

      <button onClick={runCode}>Run Code</button>

      <BlocklyWorkspace
        className="blockly-workspace"
        toolboxConfiguration={{
          kind: "flyoutToolbox",
          contents: [
            { kind: "block", type: "text" },
            { kind: "block", type: "math_number" },
            { kind: "block", type: "text_print" }
          ]
        }}
        initialXml={xml}
        workspaceConfiguration={{
          grid: {
            spacing: 20,
            length: 3,
            colour: "#ccc",
            snap: true
          }
        }}
        onXmlChange={setXml}
        onInject={(ws) => {
          setWorkspace(ws); 
        }}
      />
    </div>
  );
}


