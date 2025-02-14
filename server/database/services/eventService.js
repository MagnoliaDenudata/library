const EventModel = require('../models/eventModel');
const { Op } = require('sequelize');
const {eventFormatDate} = require('../../utils/dataUtils');
const EventApplicantModel = require('../models/event_applicantsModel');
const Event = require('../schemas/event');

class EventService{
	
	static async createEvent({newEvent}){
		const result = await EventModel.createEvent({newEvent});
		return result;
	}

	static async getAllEvent(){
		const tmpResult = await EventModel.getAllEvent();
		const result = await eventFormatDate(tmpResult);
		return result;
	}

	static async getPageEvent(option){
		const event_limit = parseInt(option.event_limit);
		const orderBy = option.orderBy;
		const event_id = orderBy == 'ASC' ? {[Op.gt]: parseInt(option.event_id),} : {[Op.lt]: parseInt(option.event_id),};
		
		const tmpResult = await EventModel.getPageEvent({ event_id, event_limit, orderBy });
		const result = await eventFormatDate(tmpResult);
		console.log(result);

		const {maxId} =  await EventModel.getMaxId();
		console.log("maxId: ", maxId);

		const lastPage = result.some(data => data.event_id === maxId);

		if (orderBy == 'DESC') {
			result.reverse(); //DESC 떄문에 뒤집혀서 오면 다시 원래 순서로 바꾸기
		}
		
		return {result, lastPage};
	}

	static async getCategoryEvent(options){
		const wheres = this.buildWhereClause(options);
		let result = await EventModel.getCategoryEvent(wheres);
    if (result.length == 0) {
      result.errorMessage = "카테고리ID 잘못 입력 OR 카테고리에 등록된 상품이 없음";
			return result
    }

    // result = result.map(el => el.get({ plain: true }));

		result.map((order, index) => {
      const { created_at } = result[index];

      // console.log(`${created_at.getFullYear()}-${created_at.getMonth()+1}-${created_at.getDate()}`);
      result[index].created_at = new Date(created_at.setHours(created_at.getHours() + 9));
      result[index].created_at = result[index].created_at.toISOString().split('T')[0];
    })
    
		return result;
	}

	static async getSearchEvent(input){
		const validationInput = this.buildWhereClause(input);
		let result = await EventModel.getSearchEvent(validationInput);
    if (result.length == 0) {
      result.errorMessage = "잘못 입력 OR 관련 도서 없음";
			return result
    }

    // result = result.map(el => el.get({ plain: true }));

		result.map((order, index) => {
      const { created_at } = result[index];

      // console.log(`${created_at.getFullYear()}-${created_at.getMonth()+1}-${created_at.getDate()}`);
      result[index].created_at = new Date(created_at.setHours(created_at.getHours() + 9));
      result[index].created_at = result[index].created_at.toISOString().split('T')[0];
    })
    
		return result;
	}

	static async applyEvent({ event_id, user_id }) {
		console.log("EventService applyEvent: ", event_id, user_id);
		console.log("EventModel: ", EventModel);
		const event = await EventModel.getOneEvent({event_id});		

		if(event.event_max_applicants !== null && event.event_current_applicants >= event.event_max_applicants){
			throw new Error('인원이 가득 찼습니다');
		}

		if(event.event_status == "expired" ){
			throw new Error('종료된 이벤트');
		}

		const existingApplicant = await EventApplicantModel.getOneEvent_applicantsByID({	event_id, user_id	});
		console.log("신청여부확인test: ",existingApplicant);

		if(existingApplicant) {
			throw new Error('이미 신청한 이벤트입니다');
		}

		await EventApplicantModel.createEvent_applicants({
			event_id: event_id,
			user_id: user_id,
		});

		await Event.increment('event_current_applicants', {
      by: 1,
      where: {
        event_id: event_id,
        // 추가적인 조건을 필요에 따라 여기에 추가
      },
    });

		return { success: true, message: '이벤트 신청 완료'}
	}

	static async getOneEvent({event_id}){
		const tmpResult = await EventModel.getOneEvent({event_id});
		const result = await eventFormatDate(tmpResult);
		await Event.increment('read_count', {
      by: 1,
      where: {
        event_id: event_id,
        // 추가적인 조건을 필요에 따라 여기에 추가
      },
    });
		return result;
	}

	static async unapplyEvent({ event_id, user_id }) {
		console.log("EventService unapplyEvent: ", event_id, user_id);
		console.log("EventModel: ", EventModel);	
		
		await EventApplicantModel.deleteEvent_applicants({
			event_id: event_id,
			user_id: user_id,
		});

		await Event.increment('event_current_applicants', {
      by: -1,
      where: {
        event_id: event_id,
        // 추가적인 조건을 필요에 따라 여기에 추가
      },
    });

		return { success: true, message: '이벤트 신청 취소 완료'}
	}

	static async getOneEvent({event_id}){
		const tmpResult = await EventModel.getOneEvent({event_id});
		const result = await eventFormatDate(tmpResult);
		await Event.increment('read_count', {
      by: 1,
      where: {
        event_id: event_id,
        // 추가적인 조건을 필요에 따라 여기에 추가
      },
    });
		return result;
	}

	static async updateEvent({ event_id, toUpdate }){
		console.log("서비스에서: ",toUpdate);
		const result = await EventModel.updateEvent({ event_id, toUpdate });
		console.log("result: ",result);
		return result;
	}

	static async deleteEvent({ event_id }){
    const result = await EventModel.deleteEvent({ event_id });
    return result;
  }


	static buildWhereClause(options){
		const wheres = {};

		//책 id 조회
		if (options.event_id && validationUtils.validateString(options.event_id)) {
			wheres.event_id = {
				[Op.eq]: options.event_id,
			};
		}

		//책 이름 조회
		if (options.event_name && validationUtils.validateString(options.event_name)) {
			wheres.event_name = {
				[Op.eq]: options.event_name,
			};
		}

		//저자 조회
		if (options.event_author) {
			wheres.event_author = {
				[Op.eq]: options.event_author,
			};
		}

		//출판사 조회
		if (options.event_publisher) {
			wheres.event_publisher = {
				[Op.eq]: options.event_publisher,
			};
		}

		//장르 조회
		if (options.event_genre && validationUtils.isValidGenre(options.event_genre)) { //장르가 존재하고 진짜 있는 장르인지
			wheres.event_genre = options.event_genre;
		}
	
		//도서 대출 여부
		if (options.event_availability !== undefined) { //장르 쿼리스트링에 넣었으면
			wheres.event_availability = Boolean(options.event_availability); //뭘 입력하든 불린으로 강제 변환해서 안전
		}
	
		//도서 고유 번호
		if (options.event_ISBN && validationUtils.validateString(options.event_ISBN)) {
			wheres.event_ISBN = {
				[Op.eq]: options.event_ISBN,
			};
		}
		return wheres;
	}

	
}
module.exports = EventService;