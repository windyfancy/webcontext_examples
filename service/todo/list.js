module.exports= {
    async onRequest() {
        var result=await this.database.select("todo_list")
        this.render(result); 
    }
}