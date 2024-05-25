
import ApplicationDataDto from "../dto/ApplicationDataDto";
import { ApplicationModel,IApplication } from "../framework/mongoose/Application.model";
import { ChannelModel } from "../framework/mongoose/Channel.model";

export default class ApplicationRepository {
  public async findByName(appName: string) {
  const result = await ApplicationModel.findOne({ name: appName });

  return result
  }

  public async create(entity: ApplicationDataDto) {

    try{
      const newApplication = await ApplicationModel.create({
        name: entity.getApplicationName(),
        defaultParameter:  entity.getDefaultParameter()
      });
      const channel = entity.getChannels()
      // console.log('=>',channel)
      if(channel){
        channel.forEach( async (channelItem) => {
          console.log('eff')
          await ChannelModel.create({applicationId: newApplication.id ,...channelItem})
        })
      }
    }catch(error){
      console.log(error)
    }
  }

}