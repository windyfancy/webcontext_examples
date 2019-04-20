module.exports= {
      
    onRequest() {
        var title=this.request.data["title"];
        this.database.insert("todo_list",{
            title:title,
            status:0,
            createTime:new Date()
        }).then((result)=>{
            this.render(JSON.stringify(result))
        })
        
        
    }

}