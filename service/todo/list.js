module.exports= {
    async onRequest() {
        var result=await this.database.select("todo_list",{orderBy:"createTime desc "})
        this.render({list:result});    
    }
}