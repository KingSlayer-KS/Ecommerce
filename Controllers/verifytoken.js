const jwt=require("jsonwebtoken")

const veriftToken=(req,res,next)=>{
    const authheader=req.headers.token;
    if (authheader){
        const token=authheader.split(" ")[1];
        jwt.verify(token,process.env.JWT_PHRASE,(err,user)=>
        {
            if(err) res.status(403).json("token not valid")
            req.user=user;
            console.log("first")
            next()
        })
    }else{
        return res.status(401).json("You are not authenticated")
    }
}

const veriftTokenandAuth=(req,res,next)=>{
    veriftToken(req,res,()=>{
        if(req.user.id===req.params.id || req.user.isAdmin){
        next()
    }
    else{
        res.status(403).json("You are not alowed to do that!")
    }})
    
}

const veriftTokenandAdmin=(req,res,next)=>{
    veriftToken(req,res,()=>{
        console.log(req.user.id)
        if(req.user.isAdmin===1){
        console.log(req.user.id)
        next()
    }
    else{
        res.status(403).json("You are not alowed to do that!")
    }})
    
}

module.exports={veriftToken,veriftTokenandAuth,veriftTokenandAdmin}