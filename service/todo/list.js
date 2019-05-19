module.exports= {
    async onLoad() {
        var result=await this.database.select("todo_list")
        this.render(result); 
    }
}