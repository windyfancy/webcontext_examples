module.exports= {
    onRequest() {
        var id=this.request.data["id"];
        this.database.delete("todo_list",{
            id:id
        }).then((result)=>{
            this.render(JSON.stringify({code:"ok!!"}))
        })
        
        
    }
}