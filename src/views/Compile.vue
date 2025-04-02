<template>
    <div class="md-editor">
        <Editormd v-model:value="selectedFile.content" :height="height" :editLanguage="editLanguage"
            :editorTheme="editorTheme" :editorAreaTheme="editorAreaTheme" :previewAreaTheme="previewAreaTheme" />
    </div>

    <div class="menu">
        <el-select v-model="selectValue" placeholder="Select" class="export-select">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button class="export-btn" type="primary" @click="exportFile">导出</el-button>
    </div>

    <div id="mdtohtml" style="display:none;"></div>
</template>

<script>
import { ref } from "vue";
// import { marked } from 'marked';
import { saveAs } from "file-saver";
import Editormd from "../components/Editormd.vue";
import { ElMessageBox, ElMessage } from 'element-plus'
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default {
    name: "Compile",
    components: {
        Editormd
    },
    setup() {
        const selectedFile = ref({ content: "# CNote" });
        const htmlContent = ref(""); // 用于存储从 Editormd.vue 传递过来的 HTML 内容
        const height = "100%";
        const editLanguage = ref(localStorage.getItem("selectedLanguage") || "en");
        const editorTheme = localStorage.getItem("editorTheme") ?? "default";
        const editorAreaTheme = localStorage.getItem("editorAreaTheme") ?? "default";
        const previewAreaTheme = localStorage.getItem("previewAreaTheme") ?? "default";

        const options = [
            { value: 'md', label: '导出 .md 格式' },
            { value: 'pdf', label: '导出 .pdf 格式' },
            { value: 'html', label: '导出 .html 格式' },
            { value: 'docx', label: '导出 .docx 格式' },
            { value: 'txt', label: '导出 .txt 格式' }
        ];
        const selectValue = ref(options[0].value)
        // const updateHtml = (newHtml) => {
        //     htmlContent.value = newHtml; // 更新 HTML 内容
        // };
        const exportFile = () => {

            // 获取导出格式的值，用于后续处理导出内容的格式
            const format = selectValue.value;

            switch (format) {
                case 'md':
                    exportMarkdown(selectedFile.value.content);
                    break;
                case 'pdf':
                    exportPdf(htmlContent.value);
                    break;
                case 'html':
                    const message = `
                        <div>
                            请选择导出的 HTML 主题：
                            <br>
                            请注意这里引入了本站的远程css样式，如本站样式失效请移步<a href="https://theme.typora.io/theme/Notion-Style/" target="_blank">此处</a>下载
                        </div>
                    `;
                    ElMessageBox({
                        title: '选择导出模式',
                        message: message,
                        dangerouslyUseHTMLString: true,
                        showCancelButton: true,
                        confirmButtonText: '黑暗模式',
                        cancelButtonText: '白天模式',
                        confirmButtonClass: 'export-hmd-cbtn'
                    })
                        .then(() => {
                            exportHtml(selectedFile.value.content, 'dark')
                        })
                        .catch(() => {
                            exportHtml(selectedFile.value.content, 'light')
                        })

                    break;
                case 'docx':
                    exportDocx(htmlContent.value);
                    break;
                case 'txt':
                    exportTxt(selectedFile.value.content);
                    break;
                default:
                    console.error('Unsupported format');
            }
        };

        // 导出为 Markdown 格式的逻辑
        const exportMarkdown = (content) => {

            console.log('Exporting as Markdown');
            const mdBlob = new Blob([content], {
                type: "text/markdown;charset=utf-8",
            });
            saveAs(mdBlob, "note.md");
        };

        // 导出为 TXT 格式的逻辑
        const exportTxt = (content) => {

            console.log('Exporting as TXT');
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = content;
            const textContent = tempDiv.textContent || tempDiv.innerText || "";
            const txtBlob = new Blob([textContent], {
                type: "text/plain;charset=utf-8",
            });
            saveAs(txtBlob, "note.txt");
        };

        // 导出为 PDF 格式的逻辑
        const exportPdf = async (htmlContent) => {

            console.log("Exporting as PDF");

            const themeCssUrl = "/notion-style-light.css";
            let fullHtml = generateFullHtml(htmlContent, themeCssUrl);

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

                pageCtx.drawImage(paddedCanvas, 0, position, paddedCanvas.width, pageCanvas.height, 0, 0, paddedCanvas.width, pageCanvas.height);
                const pageImgData = pageCanvas.toDataURL("image/png");

                if (position > 0) pdf.addPage();
                pdf.addImage(pageImgData, "PNG", 0, 0, imgWidth, (pageCanvas.height * imgWidth) / paddedCanvas.width);

                position += pageCanvasHeight;
            }

            pdf.save("note.pdf");
        };

        // 导出为 HTML 格式的逻辑
        const exportHtml = (content, theme) => {
            console.log('Exporting as HTML');

            let themeCssUrl = '/notion-style-light.css';
            if (theme == 'dark') { themeCssUrl = '/notion-style-dark.css' }
            console.log(111);

            editormd.markdownToHTML("mdtohtml", {
                markdown: content,
                htmlDecode: "style,script,iframe",
                tocm: true,
                tocContainer: "#custom-toc-container",
                taskList: true,
                tex: true,
                flowChart: true,
                sequenceDiagram: true,
            });
            var htmlContent = document.getElementById("mdtohtml").innerHTML;
            console.log(htmlContent);

            let fullHtml = generateFullHtml(htmlContent, themeCssUrl);
            const blob = new Blob([fullHtml], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'note.html';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        };

        // 导出为 DOCX 格式的逻辑
        const exportDocx = (htmlContent) => {
            console.log('Exporting as DOCX');
            let themeCssUrl = '/notion-style-light.css';
            let fullHtml = generateFullHtml(htmlContent, themeCssUrl);
        };

        const generateFullHtml = (htmlContent, themeCssUrl) => {
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

        return {
            selectedFile,
            height,
            editLanguage,
            editorTheme,
            editorAreaTheme,
            previewAreaTheme,
            selectValue,
            options,
            exportFile
        };
    }
}
</script>

<style scoped>
.md-editor {
    height: calc(100% - 30px);
    margin-top: 3px;
    position: relative;
    z-index: 1001;
}

.menu {
    height: 30px;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    padding: 10px;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.export-select {
    width: 180px;
}

.export-btn {
    margin-left: 10px;
}
</style>