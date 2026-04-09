
import { useState } from "react";

function Backtests() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    setSelectedFile(file);
    setError("");
  };

  const handleRunBacktest = async () => {
    if (!selectedFile) {
      setError("Please upload a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/backtest", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Something went wrong.");
        setResult(null);
        return;
      }

      setResult(data.getBack);
    } catch (err) {
      setError("Could not connect to backend.");
      setResult(null);
    }
  };

  return (
    <div>
      <h1>Backtests</h1>

      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleRunBacktest}>Run Python Script!!!</button>

      {error && <p>{error}</p>}
      {result !== null && <p>Biggest Open value: {result}</p>}
    </div>
  );
}

export default Backtests;

/*import { useState } from "react";
import Papa from "papaparse";

function CsvUploader() {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setMessage(`Loaded ${results.data.length} rows successfully.`);
      },
      error: () => {
        setMessage("Failed to parse CSV.");
      },
    });
  };

  return (
    <div>
      <h1>CSV Upload</h1>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <p>{message}</p>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default CsvUploader;

/*
function MyButton({ title }: { title: string }) {
  return (
    <button>{title}</button>
  );
}

export default function MyApp() {
  return (
    <div>
      <h1>Welcome to my app</h1>
      <MyButton title="I'm a button" />
    </div>
  );
}
*/
