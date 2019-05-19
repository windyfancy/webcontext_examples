module.exports= {
    async onLoad() {
        await this.database.delete("todo_list",{ id:this.request.data["id"]})
        this.render({code:"OK"})
    }
}