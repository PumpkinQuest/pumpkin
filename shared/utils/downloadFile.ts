// Cross-origin URLs ignore an <a download> attribute, so plain <a href download>
// links to mana.pumpkin.quest just navigate the browser to the raw JSON instead
// of saving it. Fetching the content and saving it as a blob works regardless of origin.
export async function downloadFile(url: string): Promise<void> {
  const res = await fetch(url);
  const blob = await res.blob();
  const filename = new URL(url).pathname.split("/").pop() ?? "download";

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
