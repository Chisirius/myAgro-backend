import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";


const roleMiddleware = (
    ...allowedRoles: string[]
) => { return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
)=>{

    try{
        const user = req.user

    if(!user){
        res.status(401).json({
            message : "Unauthorised User"
        })
        return;
    }

    // check role
    
    const role = allowedRoles.includes(req.user.userRole)

    if (!role){
        res.status(403).json({message : "Access Denied"})
        return
    }
    next()

    } catch (error){
        res.status(500).json({
            message : "Server Error"
        })
    }
    
}
  
}

export default roleMiddleware