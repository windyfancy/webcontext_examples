module.exports= {
    async onRequest() {
        await this.database.insert("todo_list",{  title:this.request.data["title"],status:0});
        this.render({code:"OK"})
    }
}