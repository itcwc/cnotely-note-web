export default {
    async fetch(request: Request, env: any, ctx: any) {
        const url = new URL(request.url);

        // 如果请求路径没有扩展名，返回 index.html
        if (!url.pathname.match(/\.[^/]+$/)) {
            return env.ASSETS.fetch('/index.html');
        }

        // 否则返回静态资源
        return env.ASSETS.fetch(request);
    }
};
