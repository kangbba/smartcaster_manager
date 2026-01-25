"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatDurationSeconds, getFileIcon } from "@/lib/utils/fileIcons";

type MediaRow = {
  id: string;
  name: string;
  type: "video" | "image" | "audio" | "other";
  bucket: string;
  path: string;
  url: string;
  size_bytes: number;
  duration_seconds: number | null;
  mime_type: string | null;
  created_at: string;
};

const formatSize = (sizeBytes: number) => {
  if (!Number.isFinite(sizeBytes)) return "0 MB";
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
};

const sanitizePathSegment = (name: string) => {
  const normalized = name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "_");
  return normalized.replace(/_+/g, "_").replace(/^_+|_+$/g, "") || "file";
};

export default function MediaPage() {
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });
      setMedia((data as MediaRow[]) || []);
    };
    void load();
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const safeName = sanitizePathSegment(file.name);
    const filePath = `${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("media").upload(filePath, file);
    if (error) {
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(filePath);

    const type = file.type.startsWith("video")
      ? "video"
      : file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("audio")
          ? "audio"
          : "other";

    const { data: rowData, error: rowError } = await supabase
      .from("media")
      .insert({
        name: file.name,
        type,
        bucket: "media",
        path: filePath,
        url: publicUrlData.publicUrl,
        size_bytes: file.size,
        duration_seconds: null,
        mime_type: file.type || null,
      })
      .select("*")
      .single();

    setUploading(false);
    if (rowError || !rowData) return;
    setMedia((prev) => [rowData as MediaRow, ...prev]);
  };

  const handleDelete = async (id: string) => {
    const target = media.find((item) => item.id === id);
    if (!target) return;
    if (!window.confirm(`삭제할까요?\n${target.name}`)) return;
    if (target.path) {
      await supabase.storage.from("media").remove([target.path]);
    }
    const { error } = await supabase.from("media").delete().eq("id", id);
    if (error) return;
    setMedia((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">미디어 라이브러리</h1>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleUpload(file);
              }
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50"
          >
            {uploading ? "업로드 중..." : "+ 파일 업로드"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">파일명</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">타입</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">크기</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">재생시간</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">업로드</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {media.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(item.type)}</span>
                    <span className="font-medium text-gray-800">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{formatSize(item.size_bytes)}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.duration_seconds ? formatDurationSeconds(item.duration_seconds) : "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.created_at?.slice(0, 10) || ""}
                </td>
                <td className="px-6 py-4">
                  <button
                    className="text-sm text-gray-500 hover:text-red-600"
                    onClick={() => handleDelete(item.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {media.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  업로드된 미디어가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
