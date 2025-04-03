import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { asBlob } from "html-docx-js-typescript";

export const exportMarkdown = (content: string) => {
    console.log('Exporting as Markdown');
    const mdBlob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    saveAs(mdBlob, "note.md");
};

export const exportTxt = (content: string) => {
    console.log('Exporting as TXT');
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    const txtBlob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    saveAs(txtBlob, "note.txt");
};

export const exportPdf = async (content: string) => {
    console.log("Exporting as PDF");

    const fullHtml = markdownToHTML(content, 'light');

    // 创建隐藏的 DOM 容器
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = "794px"; // A4 纸张宽度（像素）
    container.innerHTML = fullHtml;
    document.body.appendChild(container);

    // 生成 Canvas
    const canvas = await html2canvas(container, { scale: 2, useCORS: true });
    document.body.removeChild(container); // 清理 DOM

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
        pageCanvas.height = Math.min(pageCanvasHeight, paddedCanvas.height - position);
        const pageCtx = pageCanvas.getContext("2d");
        if (!pageCtx) {
            throw new Error("Failed to get 2D context for pageCanvas");
        }
        pageCtx.drawImage(paddedCanvas, 0, position, paddedCanvas.width, pageCanvas.height, 0, 0, paddedCanvas.width, pageCanvas.height);
        const pageImgData = pageCanvas.toDataURL("image/png");


        if (position > 0) pdf.addPage();
        pdf.addImage(pageImgData, "PNG", 0, 0, imgWidth, (pageCanvas.height * imgWidth) / paddedCanvas.width);

        position += pageCanvasHeight;
    }

    pdf.save("note.pdf");
};

export const exportHtml = (content: string, theme: "light" | "dark") => {
    console.log('Exporting as HTML');

    const fullHtml = markdownToHTML(content, theme);

    const blob = new Blob([fullHtml], { type: "text/html" });
    saveAs(blob, "note.html");
};

export const exportDocx = (content: string) => {
    console.log('Exporting as DOCX');
    const fullHtml = markdownToHTML(content, 'light');

    asBlob(fullHtml).then(data => {
        // 检查 data 类型并转换为 Blob
        const blobData = (data instanceof Blob) ? data : new Blob([data], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        saveAs(blobData, 'note.docx');
    }).catch(error => {
        console.error("Failed to export DOCX:", error);
    });
}

const generateFullHtml = (htmlContent: string, themeCssUrl: string): string => {
    // <link rel="stylesheet" href="/libs/editor.md/css/editormd.min.css">
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

const markdownToHTML = (content: string, theme: "light" | "dark") => {

    const themeCssUrl = theme === "dark" ? "/notion-style-dark.css" : "/notion-style-light.css";

    // 获取 mdtohtml 元素并清空其内容
    const mdtohtmlElement = document.getElementById("mdtohtml");
    if (mdtohtmlElement) {
        mdtohtmlElement.innerHTML = "";
    }

    // 转换 Markdown 为 HTML
    (window as any).editormd.markdownToHTML("mdtohtml", {
        markdown: content,
        htmlDecode: "style,script,iframe",
        tocm: true,
        tocContainer: "#custom-toc-container",
        taskList: true,
        tex: true,
        flowChart: true,
        sequenceDiagram: true,
    });
    const htmlContent = document.getElementById("mdtohtml")?.innerHTML || "";

    return generateFullHtml(htmlContent, themeCssUrl);
}

