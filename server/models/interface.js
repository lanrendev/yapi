const yapi = require('../yapi.js');
const baseModel = require('./base.js');
const commons = require('../utils/commons.js');

class interfaceModel extends baseModel {
  getName() {
    return 'interface';
  }

  getSchema() {
    return {
      title: { type: String, required: true },
      uid: { type: Number, required: true },
      path: { type: String, required: true },
      method: { type: String, required: true },
      project_id: { type: Number, required: true },
      catid: { type: Number, required: true },
      edit_uid: { type: Number, default: 0 },
      status: { type: String, enum: ['undone', 'done'], default: 'undone' },
      desc: String,
      markdown: String,
      add_time: Number,
      up_time: Number,
      type: { type: String, enum: ['static', 'var'], default: 'static' },
      query_path: {
        path: String,
        params: [
          {
            name: String,
            value: String
          }
        ]
      },
      req_query: [
        {
          name: String,
          value: String,
          example: String,
          desc: String,
          required: {
            type: String,
            enum: ['1', '0'],
            default: '1'
          }
        }
      ],
      req_headers: [
        {
          name: String,
          value: String,
          example: String,
          desc: String,
          required: {
            type: String,
            enum: ['1', '0'],
            default: '1'
          }
        }
      ],
      req_params: [
        {
          name: String,
          desc: String,
          example: String
        }
      ],
      req_body_type: {
        type: String,
        enum: ['form', 'json', 'text', 'file', 'raw']
      },
      req_body_is_json_schema: { type: Boolean, default: false },
      req_body_form: [
        {
          name: String,
          type: { type: String, enum: ['text', 'file'] },
          example: String,
          value: String,
          desc: String,
          required: {
            type: String,
            enum: ['1', '0'],
            default: '1'
          }
        }
      ],
      req_body_other: String,
      res_body_type: {
        type: String,
        enum: ['json', 'text', 'xml', 'raw', 'json-schema']
      },
      res_body: String,
      res_body_is_json_schema: { type: Boolean, default: false },
      custom_field_value: String,
      field2: String,
      field3: String,
      api_opened: { type: Boolean, default: false },
      index: { type: Number, default: 0 },
      tag: Array
    };
  }

  save(data) {
    let m = new this.model(data);
    return m.save();
  }

  get(id) {
    return this.model
      .findOne({
        _id: id
      })
      .exec();
  }

  getBaseinfo(id) {
    return this.model
      .findOne({
        _id: id
      })
      .select('path method uid title project_id cat_id status ')
      .exec();
  }

  getVar(project_id, method) {
    return this.model
      .find({
        project_id: project_id,
        type: 'var',
        method: method
      })
      .select('_id path')
      .exec();
  }

  getByQueryPath(project_id, path, method) {
    return this.model
      .find({
        project_id: project_id,
        'query_path.path': path,
        method: method
      })
      .exec();
  }

  getByPath(project_id, path, method, select) {
    select =
      select ||
      '_id title uid path method project_id catid edit_uid status add_time up_time type query_path req_query req_headers req_params req_body_type req_body_form req_body_other res_body_type custom_field_value res_body res_body_is_json_schema req_body_is_json_schema';
    return this.model
      .find({
        project_id: project_id,
        path: path,
        method: method
      })
      .select(select)
      .exec();
  }

  checkRepeat(id, path, method) {
    return this.model.countDocuments({
      project_id: id,
      path: path,
      method: method
    });
  }

  countByProjectId(id) {
    return this.model.countDocuments({
      project_id: id
    });
  }

  list(project_id, select) {
    select =
      select || '_id title uid path method project_id catid edit_uid status add_time up_time';
    return this.model
      .find({
        project_id: project_id
      })
      .select(select)
      .sort({ title: 1 })
      .exec();
  }

  listWithPage(project_id, page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.model
      .find({
        project_id: project_id
      })
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        '_id title uid path method project_id catid api_opened edit_uid status add_time up_time tag'
      )
      .exec();
  }

  listByPid(project_id) {
    return this.model
      .find({
        project_id: project_id
      })
      .sort({ title: 1 })
      .exec();
  }

  //获取全部接口信息
  getInterfaceListCount() {
    return this.model.countDocuments({});
  }

  listByCatid(catid, select) {
    select =
      select || '_id title uid path method project_id catid edit_uid status add_time up_time index tag';
    return this.model
      .find({
        catid: catid
      })
      .select(select)
      .sort({ index: 1 })
      .exec();
  }

  listByCatidWithPage(catid, page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.model
      .find({
        catid: catid
      })
      .sort({ index: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        '_id title uid path method project_id catid edit_uid api_opened status add_time up_time, index, tag'
      )
      .exec();
  }

  listByOptionWithPage(option, page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.model
      .find(option)
      .sort({index: 1})
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        '_id title uid path method project_id catid edit_uid api_opened status add_time up_time, index, tag'
      )
      .exec();
  }

  listByInterStatus(catid, status) {
    let option = {};
    if (status === 'open') {
      option = {
        catid: catid,
        api_opened: true
      };
    } else {
      option = {
        catid: catid
      };
    }
    return this.model
      .find(option)
      .select()
      .sort({ title: 1 })
      .exec();
  }

  del(id) {
    return this.model.remove({
      _id: id
    });
  }

  delByCatid(id) {
    return this.model.remove({
      catid: id
    });
  }

  delByProjectId(id) {
    return this.model.remove({
      project_id: id
    });
  }

  up(id, data) {
    data.up_time = yapi.commons.time();
    return this.model.update(
      {
        _id: id
      },
      data,
      { runValidators: true }
    );
  }

  upEditUid(id, uid) {
    return this.model.update(
      {
        _id: id
      },
      { edit_uid: uid },
      { runValidators: true }
    );
  }
  getcustomFieldValue(id, value) {
    return this.model
      .find({
        project_id: id,
        custom_field_value: value
      })
      .select(
        'title uid path method edit_uid status desc add_time up_time type query_path req_query req_headers req_params req_body_type req_body_form req_body_other res_body_type custom_field_value'
      )
      .exec();
  }

  listCount(option) {
    return this.model.countDocuments(option);
  }

  upIndex(id, index) {
    return this.model.update(
      {
        _id: id
      },
      {
        index: index
      }
    );
  }

  search(keyword) {
    return this.model
      .find({
        $or: [
          { 'title': new RegExp(keyword, 'ig') },
          { 'path': new RegExp(keyword, 'ig') }
        ]
      })
      .limit(10);
  }

  async globalSearch(keyword) {
    const regExp = new RegExp(keyword, 'i');
    let result = await this.model.find({
      $or: [
        {
          // 标题匹配
          title: regExp
        },
        {
          // 路径匹配
          path: regExp
        },
        {
          // 备注匹配
          markdown: regExp
        },
        {
          // 请求头匹配
          req_headers: {
            $elemMatch: {
              $or: [
                { name: regExp },
                { value: regExp },
                { example: regExp },
                { desc: regExp }
              ]
            }
          }
        },
        {
          // 请求体匹配 form 形式保存 <list>
          req_body_form: {
            $elemMatch: {
              $or: [{ name: regExp }, { desc: regExp }]
            }
          }
        },
        {
          // 请求体匹配 query 形式保存 <list>
          req_query: {
            $elemMatch: {
              $or: [{ name: regExp }, { desc: regExp }]
            }
          }
        },
        {
          // 请求体匹配 其他形式保存 <json>
          req_body_other: regExp
        },
        {
          res_body: regExp
        }
      ]
    });

    result.forEach(item => {
      item.matchResult = {
        keyword,
        isTitleMatch: false,
        title: null,
        isPathMatch: false,
        path: null,
        isRemarkMatch: false,
        remark: null,
        isRequestHeadersMatch: false,
        requestHeaders: {
          name: [],
          value: [],
          example: [],
          desc: []
        },
        isRequestQueryMatch: false,
        requestQuery: {
          name: [],
          example: [],
          desc: []
        },
        isRequestBodyMatch: false,
        requestBody: {
          name: [],
          example: [],
          desc: []
        },
        isResponseBodyMatch: false,
        responseBody: {
          name: [],
          desc: []
        }
      };
      // 标题匹配
      if (regExp.test(item.title)) {
        item.matchResult.isTitleMatch = true;
        item.matchResult.title = item.title;
      }
      // 路径匹配
      if (regExp.test(item.path)) {
        item.matchResult.isPathMatch = true;
        item.matchResult.path = item.path;
      }
      // 备注匹配
      if (regExp.test(item.markdown)) {
        item.matchResult.isRemarkMatch = true;
        item.matchResult.remark = item.markdown;
      }
      // 请求头匹配
      if (item.req_headers.length > 0) {
        item.req_headers.forEach(header => {
          if (regExp.test(header.name)) {
            item.matchResult.isRequestHeadersMatch = true;
            item.matchResult.requestHeaders.name.push(header.name);
          }
          if (regExp.test(header.value)) {
            item.matchResult.isRequestHeadersMatch = true;
            item.matchResult.requestHeaders.value.push(header.value);
          }
          if (regExp.test(header.example)) {
            item.matchResult.isRequestHeadersMatch = true;
            item.matchResult.requestHeaders.example.push(header.example);
          }
          if (regExp.test(header.desc)) {
            item.matchResult.isRequestHeadersMatch = true;
            item.matchResult.requestHeaders.desc.push(header.desc);
          }
        });
      }
      // 请求参数 query 匹配
      if (item.req_query.length > 0) {
        item.req_query.forEach(param => {
          if (regExp.test(param.name)) {
            item.matchResult.isRequestQueryMatch = true;
            item.matchResult.requestQuery.name.push(param.name);
          }
          if (regExp.test(param.example)) {
            item.matchResult.isRequestQueryMatch = true;
            item.matchResult.requestQuery.example.push(param.example);
          }
          if (regExp.test(param.desc)) {
            item.matchResult.isRequestQueryMatch = true;
            item.matchResult.requestQuery.desc.push(param.desc);
          }
        });
      }
      // 请求参数 body 匹配
      if(item.req_body_type === 'form'){
        if(item.req_body_form.length > 0){
          item.req_body_form.forEach(param => {
            if (regExp.test(param.name)) {
              item.matchResult.isRequestBodyMatch = true;
              item.matchResult.requestBody.name.push(param.name);
            }
            if (regExp.test(param.example)) {
              item.matchResult.isRequestBodyMatch = true;
              item.matchResult.requestBody.example.push(param.example);
            }
            if (regExp.test(param.desc)) {
              item.matchResult.isRequestBodyMatch = true;
              item.matchResult.requestBody.desc.push(param.desc);
            }
          })
        }
      }else{
        // type 为 json / file /raw
        if(!item.req_body_other) return;
        let result = commons.parseJsonSchema(JSON.parse(item.req_body_other), regExp);
        item.matchResult.requestBody.name = result.name;
        item.matchResult.requestBody.desc = result.desc;
        if(result.name.length > 0 || result.desc.length > 0){
          item.matchResult.isRequestBodyMatch = true;
        }    
      }
      // 响应 body 匹配
      if(!item.res_body) return;
      let result = commons.parseJsonSchema(JSON.parse(item.res_body), regExp)
      item.matchResult.responseBody.name = result.name
      item.matchResult.responseBody.desc = result.desc
      if(result.name.length > 0 || result.desc.length > 0){
        item.matchResult.isResponseBodyMatch = true
      } 
    });

    return result.filter(x => Object.values(x.matchResult).some(x => x === true));
  }
}

module.exports = interfaceModel;