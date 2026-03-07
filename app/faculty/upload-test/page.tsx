"use client";

import { useState } from "react";

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setUploadedUrl(data.data.fileUrl);
        alert("Upload successful");
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Upload Test</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 rounded bg-red-700 text-white disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload File"}
      </button>

      {uploadedUrl && (
        <div className="space-y-2">
          <p className="text-sm break-all">{uploadedUrl}</p>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-green-700 underline"
          >
            Open Uploaded File
          </a>
        </div>
      )}
    </div>
  );
}
