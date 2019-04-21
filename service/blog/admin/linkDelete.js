module.exports= {  
    onRequest() {  
        var data=this.request.data;
        this.database.delete("wb_link",{id:data.id}).then(function (e){
            this.render({msg:'{code:"OK"}'});
        })
        
    }
  }