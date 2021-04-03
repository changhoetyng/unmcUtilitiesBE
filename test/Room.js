process.env.NODE_ENV = "test";

let mongoose = require("mongoose");
let User = require("../src/model/User");
let Room = require("../src/model/Room")
let server = require("../app");
let { checkAdmin } = require("../src/defaultCheck/checkAdmin");

let chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);
let should = chai.should();
let expect = chai.expect;

let accessToken;

describe("Room", () => {
  before(async () => {
    await checkAdmin();

    let loginCredentials = {
        username: "admin",
        password: "admin",
      };

      await chai
        .request(server)
        .post("/api/auth/loginUser")
        .send(loginCredentials)
        .then((res) => {
          accessToken = res.body.accessToken;
        })
        .catch((err) => {
            console.log(err)
          });
  });

  after(async () => {
    await User.deleteMany({});
    await Room.deleteMany({});
  });

  describe("Manage Room", () => {
    let roomId;
    let subId;

    it("should add room", (done) => {
      let addRoom = {
        "name": "testingRoom",
      };

      chai
        .request(server)
        .post("/api/room/addroom")
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(addRoom)
        .end((err, res) => {
          expect(res).to.have.status(201);
          res.body.should.have.property("name").eql("testingRoom");
          roomId = res.body._id;
          done()
        })
    });

    it("should get room", (done) => {
        chai
          .request(server)
          .get("/api/room/getroom")
          .set({ Authorization: `Bearer ${accessToken}` })
          .end((err, res) => {
            expect(res).to.have.status(200);
            res.body.should.have.property("data")
            res.body.data.should.be.an('array');
            done()
          })
      });

      it("should add sub", (done) => {
        let addSub = {
            "roomId": roomId,
            "subCategory": "testSub1"
          };

        chai
          .request(server)
          .patch("/api/room/addSub")
          .set({ Authorization: `Bearer ${accessToken}` })
          .send(addSub)
          .end((err, res) => {
            expect(res).to.have.status(201);
            res.body.data.subCategory[0].should.have.property("subName").eql("testSub1")
            subId = res.body.data.subCategory[0]._id
            done()
          })
      });

      it("should delete sub", (done) => {
        let deleteSub = {
            "roomId": roomId,
            "subCategoryId": subId
          };

        chai
          .request(server)
          .patch("/api/room/deleteSub")
          .set({ Authorization: `Bearer ${accessToken}` })
          .send(deleteSub)
          .end((err, res) => {
            expect(res).to.have.status(201);
            done()
          })
      });
  });
});
