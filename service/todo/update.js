module.exports= {
    onRequest() {
        var id=this.request.data["id"];
        var title=this.request.data["title"];
        this.database.update("todo_list",{
            id:id,
            title:title,
            status:0
        }).then((result)=>{
            this.render(JSON.stringify({code:"ok!!!"}))
        })
        
        
    }
}