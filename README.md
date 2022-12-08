# 2022_capstone

캡스톤 디자인 07분반 2조
========================
교육용 실시간 블록코딩 서비스 사용 매뉴얼
============================================

**************************************************
## 함께 한 사람들
김효연, 권용한, 김용덕

******************************************************
## 설치 

### 1.로컬 환경의 경우
1)nodejs, npm(16버전 권장, 상위 버전이라면 nvm으로 버전 관리를 통해 16버전으로 사용), mysql 설치
2)capstone_all/config/config.json 파일에서 development에 username, password에 자신의 mysql 계정 정보 입력)
3)capstone_all 폴더에서 npm i(혹은 npm install)(모듈 설치)
4)npx sequelize db:create (mysql에 db 설치)
5)npm start
6)localhost:포트번호 로 접근

### 2.AWS 배포할 경우
1)nodejs, npm(16버전 권장, 상위 버전이라면 nvm으로 버전 관리를 통해 16버전으로 사용), mysql 설치
2)localhost->aws ec2 퍼블릭 주소 변경 (1. view/workspace.html 2.public.code.js)
3)포트번호 8080로 변경(80포트를 8080로 포워딩하기 때문) -> ( 1. view/workspace.html 2.public.code.js 3.app.js)
4)서버 관리자(linux)계정(sudo su 명령어를 통해 접근 가능)에서 
iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080 
(80번 포트로 들어오는 요청을 8080번 포트로 변경, 포워딩) 
5)config/config.json에서 development에 username, password를 자신의 mysql 계정 정보 입력(host는 aws rds 사용한다면 rds의 엔드포인트 입력)
capstone_all 폴더에서
6)npm i 혹은 npm install 명령어 입력(npm 버전이 16버전에서 원활히 작동하기에 nvm 사용 추천, nvm 설치 후 nvm에서 npm 16버전 설치 후 nvm use 16 명령어 입력 -> npm i)
7)npx sequelize db:create (config/config.json에서 mysql 계정 정보를 잘 입력해야함, db를 설치)
8)npm start
9)이후 해당 ec2의 퍼블릭 주소로 접속(포워딩 하지 않았다면 ec2 퍼블릭 주소:포트번호)

*********************************************************************************
*********************************************************************************

## 메뉴얼

### 1. 메인 화면입니다.
![image](https://user-images.githubusercontent.com/97766222/206550862-e9468671-02e2-4e6f-89f4-f1a25c08cf50.png)

### 2.	회원 가입을 통해 회원 가입 후
![image](https://user-images.githubusercontent.com/97766222/206551121-581122a0-214f-4f83-83cb-ce935473ed8b.png)

### 3.	회원 가입 후 new workspace 버튼을 눌러 새로운 workspace를 생성합니다.
![image](https://user-images.githubusercontent.com/97766222/206551183-9174c098-64b2-461c-87d2-a2705e99b8b3.png)

### 4.	Workspace에 입장한 모습이며, ec2 주소/workspace/(숫자) (혹은 localhost:포트번호/workspace/(숫자)를 통해 다른 사용자도 입장 가능합니다.
![image](https://user-images.githubusercontent.com/97766222/206551282-d2541524-2853-4698-ba36-ddc903b3e54c.png)

### 5.	Block을 생성한 모습입니다.
![image](https://user-images.githubusercontent.com/97766222/206551339-84ffd70d-c0c5-4676-af8e-2bf2ad5ef2b5.png)

### 6. 해당 모습을 다른 사용자도 확인 가능합니다.
![image](https://user-images.githubusercontent.com/97766222/206551407-6818803c-378b-4320-b056-7e54b0e1c611.png)

### 7.	채팅 기능으로, 수업 중 필요한 소통을 할 수 있습니다.
![image](https://user-images.githubusercontent.com/97766222/206551459-9495c3c3-492d-4296-85cb-8461514d2472.png)

### 8.	lock기능이 걸린 상황의 다른 사용자의 화면이며, lock은 host(workspace의 최초 생성자)만 가능합니다.(host를 선생님으로 생각하고 제작하여 lock기능과 unlock 기능은 선생님(host)만 가능한 기능입니다.)
![image](https://user-images.githubusercontent.com/97766222/206551509-85cc402f-b239-4335-ab5a-3577b9900cee.png)

### 9.	unlock 기능을 사용하면 host를 제외한 다른 사용자는 다시 정상적으로 블록을 조정 가능합니다.
![image](https://user-images.githubusercontent.com/97766222/206551575-0fff1602-3752-4d98-ade9-e1c7025fa4cd.png)

### 10.	block 실행 결과입니다.
![image](https://user-images.githubusercontent.com/97766222/206551630-67c55494-8264-4030-bb05-d402f4c23832.png)

### 11. 다음과 같이 코멘트 기능을 활용할 수도 있습니다.
<img width="472" alt="image" src="https://user-images.githubusercontent.com/97766222/206553191-fc85241b-e785-426e-9c48-210e180fa7e2.png">

### 12.	copy 사용 전 모습입니다.
![image](https://user-images.githubusercontent.com/97766222/206551665-90383d87-deef-41bc-afa2-03f9f8e92ca5.png)

### 13.	copy 기능을 통해 다른 사용자의 block을 복사할 수 있습니다.
![image](https://user-images.githubusercontent.com/97766222/206551710-4f830f6f-f104-4629-80a2-f32253ba390e.png)


