import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppErrors";
import { SurveysUsersRepository } from "../repositories/SuerveysUsersRepository";


// http://localhost:3333/answers/4?u=686558df-9614-4d8f-9b22-2d1c8e0219ac
/**
 * Route Params => Parametro que compõe a rota /
 * routes.get("/answer/:value")
 * 
 * Query Params => Busca, Paginação, não obrigatórios
 * ?
 * chave=valor
 */

class AnswerController {

    async execute(request: Request, response: Response) {
        const { value } = request.params;
        const { u } = request.query;

        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const surveyUser = await surveysUsersRepository.findOne({
            id: String(u)
        });

        if(!surveyUser) {
            throw new AppError("Survey User does not exists!");            
        }

        surveyUser.value = Number(value);

        await surveysUsersRepository.save(surveyUser);

        return response.json(surveyUser);
    }
}

export {AnswerController}