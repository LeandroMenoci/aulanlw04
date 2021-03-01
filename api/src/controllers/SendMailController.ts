import { Request, Response } from "express";
import { resolve } from 'path';
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppErrors";
import { SurveysUsersRepository } from "../repositories/SuerveysUsersRepository";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { UsersRepository } from "../repositories/UserRespository";
import SendMailService from "../services/SendMailService";



class SendMailController {

    async execute(request: Request, response: Response) {
        const {email, survey_id} = request.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const user = await usersRepository.findOne({email});

        if(!user) {
            return response.status(400).json({
                error: 'User does not exists',
            });
        }

        const survey = await surveysRepository.findOne({id: survey_id})

        if(!survey) {
            throw new AppError("Survey does not exists!");
        }

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");


        const surveyUrserAlreadyExists = await surveysUsersRepository.findOne({
            where: {user_id: user.id, value: null},
            relations: ["user", "survey"]
        });

        const variables = {
            name: user.name,
            title: survey.title,
            drescription: survey.drescription,
            id: "",
            link: process.env.URL_MAIL,
        };



        if(surveyUrserAlreadyExists) {
            variables.id = surveyUrserAlreadyExists.id;
            await SendMailService.execute(email, survey.title, variables, npsPath);
            return response.json(surveyUrserAlreadyExists);
        }

        // salvar as informçãoes na tabela surveyUser
        const surveyUser = surveysUsersRepository.create({
            user_id: user.id,
            survey_id,
        })
        await surveysUsersRepository.save(surveyUser);
        // Enviar email para o usuário

        variables.id = surveyUser.id;

        await SendMailService.execute(email, survey.title,  variables, npsPath);

        return response.json(surveyUser);
    }
}

export {SendMailController}
