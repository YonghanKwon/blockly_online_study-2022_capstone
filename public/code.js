

//MSG
var MSG = {
    title: "코드",
    blocks: "블록",
    linkTooltip: "블록을 저장하고 링크를 가져옵니다.",
    runTooltip: "작업 공간에서 블록으로 정의된 프로그램을 실행합니다.",
    badCode: "프로그램 오류:\n%1",
    timeout: "최대 실행 반복을 초과했습니다.",
    trashTooltip: "모든 블록을 버립니다.",
    catLogic: "논리",
    catLoops: "반복",
    catMath: "수학",
    catText: "텍스트",
    catLists: "목록",
    catColour: "색",
    catVariables: "변수",
    catFunctions: "기능",
    listVariable: "목록",
    textVariable: "텍스트",
    httpRequestError: "요청에 문제가 있습니다.",
    linkAlert: "다음 링크로 블록을 공유하세요:\n\n%1",
    hashError: "죄송하지만 '%1'은 어떤 저장된 프로그램으로 일치하지 않습니다.",
    loadError: "저장된 파일을 불러올 수 없습니다. 혹시 블록리의 다른 버전으로 만들었습니까?",
    parseError: "%1 구문 분석 오류:\n%2\n\n바뀜을 포기하려면 '확인'을 선택하고 %1을 더 편집하려면 '취소'를 선택하세요."
};
  
  //category
  for (var messageKey in MSG) {
    if (messageKey.indexOf('cat') === 0) {
      Blockly.Msg[messageKey.toUpperCase()] = MSG[messageKey];
    }
  }
  
  //get toolbox from html
  var toolboxText = document.getElementById('toolbox').outerHTML;
  toolboxText = toolboxText.replace(/(^|[^%]){(\w+)}/g, function(m, p1, p2) {return p1 + MSG[p2];});
  var toolboxXml = Blockly.Xml.textToDom(toolboxText);
  
  //get user_name
  var user_name = document.getElementById('user_name').innerText;
  var user_list = ["user_host", "user_student1", "user_student2", "user_student3"];
  var other_user = [];
  
  //add eventlistener at DOMContentLoaded
  var my_workspace;
  var other_workspace;
  var workspace_xml = {};

  const socket = io.connect('http://localhost:8002',{
        path: '/socket.io',
    });
  
  socket.on('changeSnapshot', function(data){
    var sn = data.id;
    console.log(sn);
    var xml = Blockly.Xml.textToDom(data.snapshot);
    console.log(xml);
    //내 workspace가 변했을 때
    if(sn == 3){
      my_workspace.clear();
      Blockly.Events.disable();
      Blockly.Xml.domToWorkspace(xml, my_workspace);
      Blockly.Events.enable();
    }
    //내가 보고있는 다른 workspace가 변했을 때
    if(sn == 3){
      other_workspace.clear();
      Blockly.Events.disable();
      Blockly.Xml.domToWorkspace(xml, other_workspace);
      Blockly.Events.enable();
    }
    else{
      workspace_xml[sn] = xml;
      console.log(sn);
    }
  });

  window.addEventListener('storage',async () => {
    var sn = window.localStorage.getItem("now");
    console.log(window.localStorage.getItem(sn));
    var xml = Blockly.Xml.textToDom(window.localStorage.getItem(sn));
    console.log(xml);
    if(sn == user_name){
      my_workspace.clear();
      Blockly.Events.disable();
      Blockly.Xml.domToWorkspace(xml, my_workspace);
      Blockly.Events.enable();
    }
    if(sn == selected){
      other_workspace.clear();
      Blockly.Events.disable();
      Blockly.Xml.domToWorkspace(xml, other_workspace);
      Blockly.Events.enable();
    }
    else{
      workspace_xml[sn] = xml;
      console.log(sn);
    }
  });

    function getURLParams_last(url) {
        var url_arr = url.split("/");
        return url_arr[url_arr.length-1];
    }

    function getURLParams2_domain(url){
        var url_arr = url.split("/");
        console.log(url_arr[3] + url_arr[4]);
        return url_arr[4];
    }

  document.addEventListener('DOMContentLoaded',async function(){
      //fill my container(left)
      //console.log(getURLParams(document.location.href));

      my_workspace = Blockly.inject('content_area',
      {
        toolbox: toolboxXml,
        media: '../media/',
      });
  
      //fill other container(right)
      other_workspace = Blockly.inject('content_area1',
      {
        toolbox: toolboxXml,
        media: '../media/',
      });
  
      //make xml of user
      for(var i=0;i<user_list.length;i++){
        workspace_xml[user_list[i]] = Blockly.Xml.workspaceToDom(Blockly.inject('fake_workspace',
        {
          toolbox: toolboxXml,
        }));
      }
  
      //fiil other_user
      var count = 0;
      for(var i=0;i<user_list.length;i++){
        if(user_list[i]!=user_name){
          count+=1;
          other_user.push(user_list[i]);
          console.log('other_user' + count);
          document.getElementById('other_user' + count).innerText = user_list[i];
        }
      }
      console.log(other_user);
      selected = other_user[0];
  
      //fill user_tab
      document.getElementById('user').innerText = user_name;
      for(var i=1;i<=other_user.length;i++){
        document.getElementById('other_user' + i).innerText = other_user[i-1];
      }
  
      //reserve words(for run's timeout)
      Blockly.JavaScript.addReservedWords('code,timeouts,checkTimeout');
  
      //insert block eventlistener
      //insert listener about my change
      my_workspace.addChangeListener((event) => {
        if (event.type === Blockly.Events.BLOCK_MOVE  ||event.type === Blockly.Events.BLOCK_CHANGE
          || event.type == Blockly.Events.BLOCK_CREATE || event.type == Blockly.Events.BLOCK_DELETE) {
          workspace_xml[user_name] = Blockly.Xml.workspaceToDom(my_workspace);
          console.log(workspace_xml[user_name]);
          window.localStorage.setItem(user_name, Blockly.Xml.domToText(workspace_xml[user_name]));
          window.localStorage.setItem("now", user_name);

          console.log(getURLParams2_domain(document.location.href)+'/change/snapshot');
          
          axios.post(getURLParams2_domain(document.location.href)+"/change/snapshot",{
                snapshot: Blockly.Xml.domToText(workspace_xml[user_name]),
          })
          .then(() => {
            console.log('성공');
          })
          .catch((error) => {
            console.error(error);
          });
        }
        if (event.isUiEvent) {
          return;
        }
      });

  /* //내가 보고 있는 곳을 고치게 되었을 때 보내는 것
      other_workspace.addChangeListener((event) => {
        if (event.type === Blockly.Events.BLOCK_MOVE  ||event.type === Blockly.Events.BLOCK_CHANGE
          || event.type == Blockly.Events.BLOCK_CREATE || event.type == Blockly.Events.BLOCK_DELETE) {
            workspace_xml[selected] = Blockly.Xml.workspaceToDom(other_workspace);
            console.log(workspace_xml[selected]);
            window.localStorage.setItem(selected, Blockly.Xml.domToText(workspace_xml[selected]));
            window.localStorage.setItem("now", selected);
            axsios.post('/workspace/{{}}')
        }
      });
*/
  }, false);
  
  //copy workspace
  async function workspace_copy(workspace1, workspace2){
    var xmlDom = Blockly.Xml.workspaceToDom(workspace1);
    workspace2.clear();
    Blockly.Xml.domToWorkspace(xmlDom, workspace2); 
  }
  
  //setting workspace to readonly
  async function workspace_readonly(workspace){
    var xmlDom = Blockly.Xml.workspaceToDom(workspace);
    workspace.dispose();
    workspace = Blockly.inject('content_area1',
      {
        toolbox: toolboxXml,
        media: '../media/',
        readOnly: true,
      });
    Blockly.Xml.domToWorkspace(xmlDom, workspace);
  }
  
  /*student_tab_event*/
  var student = ["student1", "student2", "student3"];
  var selected = "other_user1";
  
  function student_tab_handler(clickedName) { 
    clickedName = clickedName.id;
    //before workspace 작업 처리
    if (document.getElementById("other_user1").classList.contains('tabon')) {
  
    }
    else if (document.getElementById("other_user2").classList.contains('tabon')) {
  
    }
    else if (document.getElementById("other_user3").classList.contains('tabon')) {
      
    }
  
    // Deselect all tabs and hide all panes.
    for (var i = 1; i <= other_user.length; i++) {
      var name = 'other_user' + i;
      var tab = document.getElementById(name);
      tab.classList.add('taboff');
      tab.classList.remove('tabon');
    }
  
    // Select the active tab.
    
    selected = document.getElementById(clickedName).innerText;
    var selectedTab = document.getElementById(clickedName);
    selectedTab.classList.remove('taboff');
    selectedTab.classList.add('tabon');
  
    //after workspace 작업 처리
    socket.on('changeSnapshot', function(data){
        var xml = Blockly.Xml.textToDom(data.snapshot);
        other_workspace.clear();
        Blockly.Events.disable();
        Blockly.Xml.domToWorkspace(xml, other_workspace);
        Blockly.Events.enable();
    });
  };
  
  /*only one checkbox*/
  var looking_work_box;
  var authoered_student;
  
  function getCheckboxValue(element)  {
    if(element.value == authoered_student){
      element.checked = false;
      authoered_student = 0;
    }
    else{
      // 선택된 목록 가져오기
      const checkboxes 
          = document.getElementsByName("check_right");
      
      // 선택된 목록에서 value 찾기
      checkboxes.forEach((el) => {
        el.checked = false;
      });
      
      authoered_student = element.value;
      element.checked = true;
      console.log(authoered_student)
    }
  }
  
  /**
   * Bind a function to a button's click event.
   * On touch enabled browsers, ontouchend is treated as equivalent to onclick.
   * @param {!Element|string} el Button element or ID thereof.
   * @param {!Function} func Event handler to bind.
   */
  function  bindClick(el, func) {
    if (typeof el === 'string') {
      el = document.getElementById(el);
    }
    el.addEventListener('click', func, true);
  };
  
  /**
   * Execute the user's code.
   * Just a quick and dirty eval.  Catch infinite loops.
   * @param {Event} event Event created from listener bound to the function.
   */
   function runJs(event) {
    Blockly.JavaScript.INFINITE_LOOP_TRAP = 'checkTimeout();\n';
    var timeouts = 0;
    var checkTimeout = function() {
      if (timeouts++ > 1000000) {
        throw MSG['timeout'];
      }
    };
  
    var code = Blockly.JavaScript.workspaceToCode(my_workspace);
    Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
    try {
      eval(code);
    } catch (e) {
      alert(MSG['badCode'].replace('%1', e));
    }
  };
  
  /**
   * Discard all blocks from the workspace.
   */

  function discard() {
    console.log(document.location.href);
  };
  
  function download() {
    console.log(1);
    var download_txt = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(my_workspace));
    const blob = new Blob([download_txt], {type: 'text/plain'})
    print(blob);
    const downloadUrl = window.URL.createObjectURL(blob); // 해당 file을 가리키는 url 생성
   
    const anchorElement = document.createElement();
    if(anchorElement){
    anchorElement.href = downloadUrl; // href에 url 달아주기
   
    anchorElement.click(); // 코드 상으로 클릭을 해줘서 다운로드를 트리거
   
    document.body.removeChild(anchorElement); // cleanup - 쓰임을 다한 a 태그 삭제
    window.URL.revokeObjectUrl(downloadUrl); // cleanup - 쓰임을 다한 url 객체 삭제
    }
  }
  
  bindClick('trashButton',discard);
  bindClick('runButton', runJs);
  bindClick('linkButton', download);
  
  
  
  