module.exports= {
    async onLoad() {
        await this.database.update("todo_list",this.request.data)
        this.render({code:"OK"})
    }
}