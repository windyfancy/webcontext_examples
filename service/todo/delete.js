module.exports= {
    async onRequest() {
        await this.database.delete("todo_list",{ id:this.request.data["id"]})
        this.render({code:"OK"})
    }
}