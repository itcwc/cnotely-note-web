import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { asBlob } from "html-docx-js-typescript";
import TurndownService from "turndown";

// 导出选项接口
export interface ExportOptions {
  content: string;
  fileName: string;
  isHtmlContent?: boolean;
  theme?: "light" | "dark";
}

export const exportMarkdown = (options: ExportOptions) => {
  console.log("Exporting as Markdown");
  const { content, fileName } = options;
  const mdBlob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  saveAs(mdBlob, `${fileName}.md`);
};

export const exportTxt = (options: ExportOptions) => {
  console.log("Exporting as TXT");
  const { content, fileName } = options;
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;
  const textContent = tempDiv.textContent || tempDiv.innerText || "";
  const txtBlob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  saveAs(txtBlob, `${fileName}.txt`);
};

export const exportPdf = async (options: ExportOptions) => {
  console.log("Exporting as PDF");

  const { content, fileName, isHtmlContent = false } = options;

  console.log("Exporting as PDF", content);
  console.log("Exporting as isHtmlContent", isHtmlContent);

  const fullHtml = isHtmlContent ? generateFullHtml(content, "https://cnote.itcwc.com/notion-style-light.css") : markdownToHTML(content, "light");

  // 创建隐藏的 DOM 容器
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "794px"; // A4 纸张宽度（像素）
  container.style.height = "auto"; // 自动高度
  container.style.minHeight = "200px"; // 最小高度，确保canvas不会为空
  container.style.padding = "20px";
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  // 确保容器有内容和高度
  container.style.display = "block";
  // 等待内容渲染
  await new Promise(resolve => setTimeout(resolve, 100));

  // 生成 Canvas
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });
  document.body.removeChild(container); // 清理 DOM

  // 检查canvas是否有效
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error("Failed to generate canvas with valid dimensions");
  }

  // **🔹 新增：给 Canvas 增加白色边距**
  const padding = 65; // 额外边距（像素）
  const paddedCanvas = document.createElement("canvas");
  paddedCanvas.width = canvas.width + padding * 2;
  paddedCanvas.height = canvas.height + padding * 2;

  const ctx = paddedCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D context for paddedCanvas");
  }
  ctx.fillStyle = "#FFFFFF"; // 设置白色背景
  ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
  ctx.drawImage(canvas, padding, padding); // 画入原始 Canvas

  // **🔹 修正分页逻辑**
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = 210; // A4 宽度 (mm)
  const pageHeight = 297; // A4 高度 (mm)
  const imgWidth = pageWidth;
  const pageCanvasHeight = (pageHeight * paddedCanvas.width) / pageWidth; // 计算单页高度
  let position = 0;

  while (position < paddedCanvas.height) {
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = paddedCanvas.width;
    pageCanvas.height = Math.min(
      pageCanvasHeight,
      paddedCanvas.height - position
    );
    const pageCtx = pageCanvas.getContext("2d");
    if (!pageCtx) {
      throw new Error("Failed to get 2D context for pageCanvas");
    }
    pageCtx.drawImage(
      paddedCanvas,
      0,
      position,
      paddedCanvas.width,
      pageCanvas.height,
      0,
      0,
      paddedCanvas.width,
      pageCanvas.height
    );
    const pageImgData = pageCanvas.toDataURL("image/png");

    if (position > 0) pdf.addPage();
    pdf.addImage(
      pageImgData,
      "PNG",
      0,
      0,
      imgWidth,
      (pageCanvas.height * imgWidth) / paddedCanvas.width
    );

    position += pageCanvasHeight;
  }

  pdf.save(`${fileName}.pdf`);
};

export const exportHtml = (options: ExportOptions) => {
  console.log("Exporting as HTML");
  const { content, fileName, isHtmlContent = false, theme = "light" } = options;

  const themeCssUrl =
    theme === "dark"
      ? "https://cnote.itcwc.com/notion-style-dark.css"
      : "https://cnote.itcwc.com/notion-style-light.css";

  const fullHtml = isHtmlContent ? generateFullHtml(content, themeCssUrl) : markdownToHTML(content, theme);

  const blob = new Blob([fullHtml], { type: "text/html" });
  saveAs(blob, `${fileName}.html`);
};

export const exportDocx = (options: ExportOptions) => {
  console.log("Exporting as DOCX");
  const { content, fileName, isHtmlContent = false } = options;

  const fullHtml = isHtmlContent ? generateFullHtml(content, "https://cnote.itcwc.com/notion-style-light.css") : markdownToHTML(content, "light");

  asBlob(fullHtml)
    .then((data) => {
      // 检查 data 类型并转换为 Blob
      const blobData =
        data instanceof Blob
          ? data
          : new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
      saveAs(blobData, `${fileName}.docx`);
    })
    .catch((error) => {
      console.error("Failed to export DOCX:", error);
    });
};

const generateFullHtml = (htmlContent: string, themeCssUrl: string): string => {
  // <link rel="stylesheet" href="/libs/editor.md/css/editormd.min.css">

  // 调试：检查传入的内容长度
  console.log("Payload length:", htmlContent?.length);

  if (!htmlContent || htmlContent.trim() === "") {
    console.warn("Warning: htmlContent is empty!");
  }

  return `
        <!DOCTYPE html>
        <html lang="zh">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Exported Document</title>
            <link rel="stylesheet" href="${themeCssUrl}">
            
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>`;
};

export const markdownToHTML = (content: string, theme: "light" | "dark") => {
  const themeCssUrl =
    theme === "dark"
      ? "https://cnote.itcwc.com/notion-style-dark.css"
      : "https://cnote.itcwc.com/notion-style-light.css";

  // 1. 生成唯一的临时 ID，防止 ID 冲突
  const uniqueId = `temp_md_render_${Date.now()}`;

  // 2. 创建临时容器
  const div = document.createElement("div");
  div.id = uniqueId;

  // 关键优化：使用 absolute 移出视口，而不是 display: none
  // 许多 Markdown 插件（如流程图）在 display: none 下无法计算尺寸从而渲染失败
  div.style.position = "absolute";
  div.style.left = "-99999px";
  div.style.top = "-99999px";
  div.style.visibility = "hidden"; // 双重保险

  document.body.appendChild(div);

  try {
    // 3. 执行转换
    // 注意：editor.md 是基于 jQuery 的，它需要 DOM 存在于文档流中才能工作
    (window as any).editormd.markdownToHTML(uniqueId, {
      markdown: content,
      htmlDecode: "style,script,iframe",
      tocm: true,
      // 如果不需要把目录渲染到页面其他地方，建议去掉 tocContainer 或者指向临时容器内部
      // tocContainer: "#custom-toc-container", 
      taskList: true,
      tex: true,
      flowChart: true,
      sequenceDiagram: true,
    });

    // 4. 获取生成的 HTML
    const htmlContent = div.innerHTML;

    // 如果内容为空，给一个警告
    if (!htmlContent) {
      console.warn("Markdown 渲染结果为空，请检查输入内容或插件加载状态");
    }

    // 5. 包装并返回
    return generateFullHtml(htmlContent, themeCssUrl);

  } catch (error) {
    console.error("Markdown to HTML conversion failed:", error);
    // 发生错误时返回兜底内容，防止整个导出流程崩溃
    return generateFullHtml(`<p>Render Error: ${error}</p>`, themeCssUrl);
  } finally {
    // 6. 清理现场：无论成功失败，都移除临时 DOM
    if (document.body.contains(div)) {
      document.body.removeChild(div);
    }
  }
};

/**
 * 专门用于将 HTML（Quill 内容）转换为 Markdown 并导出
 */
export const exportMarkdownFromHtml = (options: ExportOptions) => {
  console.log("Exporting Rich Text as Markdown via Turndown");
  const { content, fileName } = options;

  // 1. 初始化 Turndown 服务
  const turndownService = new TurndownService({
    headingStyle: "atx",     // 标题使用 # 格式
    hr: "---",               // 分割线格式
    bulletListMarker: "-",   // 无序列表使用 -
    codeBlockStyle: "fenced",// 代码块使用 ``` 格式
    emDelimiter: "_",        // 斜体
  });

  // 2. 自定义规则：保留一些 HTML 标签或处理特殊格式（可选）
  // 例如：Quill 中的下划线 <u> 标签在 Markdown 中没有标准对应，可以保留或忽略
  turndownService.addRule('underline', {
    filter: ['u'],
    replacement: (content) => `<u>${content}</u>`
  });

  try {
    // 3. 执行转换
    // 如果 content 是纯 HTML 字符串，直接转换
    const markdown = turndownService.turndown(content);

    // 4. 执行导出
    const mdBlob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    saveAs(mdBlob, `${fileName}.md`);

    console.log("Turndown conversion successful");
  } catch (error) {
    console.error("Turndown conversion failed:", error);
    throw error; // 抛出异常供 UI 层处理（如显示 ElMessage）
  }
};