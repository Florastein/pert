export async function uploadFile(file: File, userId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const res = await fetch("http://localhost:8000/files/process", {
    method: "POST",
    body: formData,
  });

  return res.json();
}
