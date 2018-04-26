/*
 * (C) Copyright Blackboard Inc. 1998-2007 - All Rights Reserved
 *
 * Permission to use, copy, modify, and distribute this software
 * without prior explicit written approval is strictly prohibited.
 * Please refer to the file "copyright.html" for further important
 * copyright and licensing information.
 *
 * BLACKBOARD MAKES NO REPRESENTATIONS OR WARRANTIES ABOUT THE
 * SUITABILITY OF THE SOFTWARE, EITHER EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-
 * INFRINGEMENT. BLACKBOARD SHALL NOT BE LIABLE FOR ANY DAMAGES
 * SUFFERED BY LICENSEE AS A RESULT OF USING, MODIFYING OR
 * DISTRIBUTING THIS SOFTWARE OR ITS DERIVATIVES.
 */

function openColorPicker(formObj, imgObj, prevObj) {
  var win = window.open("/webapps/taglibs/colorpick.jsp",
    "ColorPicker",
    "toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=0,resizable=1,width=292,height=196");
  window.TextToSet = formObj;
  window.ImgToSet = imgObj;
  if ( prevObj ) {
    window.PrevtoSet = prevObj;
  } else {
    window.PrevtoSet = "";
  }
}

function getSelectedButton(buttonGroup) {
  for (var i = 0; i < buttonGroup.length; i++) {
    if (buttonGroup[i].checked) {
      return i;
    }
  }
  return 0;
}

function showbutton(myform) {
  var mytypefield = myform.props___pk1_pk2__button_type;
  var myshapefield = myform.props___pk1_pk2__button_shape;
  var mystylefield = myform.props___pk1_pk2__button_style;
  var type_index = mytypefield.selectedIndex;
  var mytype, mybutton;
  if (type_index >= 0) {
    mytype = mytypefield[type_index].value;
  } else {
    mytype = mytypefield[0].value;
    mytypefield.selectedIndex = 0;
  }
  var shape_index = getSelectedButton(myshapefield);
  var myshape = myshapefield[shape_index].value;
  var myselect = mystylefield.selectedIndex;
  if (myselect >= 0) {
    mybutton = mystylefield[myselect].value;
  } else {
    mybutton = mystylefield[0].value;
    mystylefield.selectedIndex = 0;
  }
  var pathtoimage = getCdnURL( "/images/ci/cnavbtns/" + mytype + "/" + mybutton + "/" + myshape + "/blank.png" );
  document.button.src = pathtoimage;
}

function popin(sel, arr) {
  var start = sel.options.length;
  var end = arr.length;
  sel.options[sel.selectedIndex].selected = false;
  sel.options.length = end;
  for (var j = 0; j < end; j++) {
    sel.options[j].value = arr[j].value;
    sel.options[j].text = arr[j].text;
  }
  return true;
}

function button_switcher(selBig, selSmall) {
  var startIndex = selSmall.selectedIndex;
  popin(selSmall, window.button_master[selBig.selectedIndex]);
  selSmall.selectedIndex = startIndex;
  showbutton(selBig.form);
}
