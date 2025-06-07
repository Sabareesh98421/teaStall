function urlBuilder(baseUrl:string,targetPath: string): URL{
    const url = new URL(targetPath, baseUrl);
    return url;
}