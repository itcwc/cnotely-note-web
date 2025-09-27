export default {
    async fetch(request: Request, env: any, ctx: any) {
        const url = new URL(request.url);

        // 判断是否为静态资源（带扩展名的文件）
        if (!url.pathname.match(/\.[^/]+$/)) {
            // 如果不是静态资源，返回 index.html，让前端 Vue Router 处理 SPA 路由
            return env.ASSETS.fetch('/index.html');
        }

        // 静态资源直接返回
        return env.ASSETS.fetch(request);
    }
};
