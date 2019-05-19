module.exports= {
    async onLoad() {
        await this.database.insert("todo_list",{  title:this.request.data["title"],status:0});
        this.render({code:"OK"})
    }
}