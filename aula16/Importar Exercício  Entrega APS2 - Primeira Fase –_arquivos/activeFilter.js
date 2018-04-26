if (!window.activeFilter)
{
var activeFilter = {};
activeFilter.listId = "listContainer";
activeFilter.searchCriteria = Class.create();
activeFilter.criterionCategory = Class.create();
activeFilter.Criterion = Class.create();
activeFilter.View = Class.create();
activeFilter.Map = Class.create();
var searchCriteriaObj = new activeFilter.searchCriteria();

activeFilter.showDataAll = function()
{
  var filterItemContainer = $$(".paletteItems");
  var itemId;
  var a;
  for ( var i = 0; i < filterItemContainer.length; i++ )
  {
    itemId = filterItemContainer[i].id;
    a = $(itemId + "Link").getElementsByTagName("a")[0];
    $(itemId).blindDown( { duration:0.3 } );
    a.className = "itemHead itemHeadOpen";
    var sc = activeFilter.getSearchCriteriaInstance(false);
    sc.setCriterionCategoryExpanded(itemId, true);
  }
  $('viewAllButton').focus();
};

activeFilter.showDataNone = function()
{
  var filterItemContainer = $$(".paletteItems");
  var itemId;
  var a;
  for ( var i = 0; i < filterItemContainer.length; i++ )
  {
    itemId = filterItemContainer[i].id;
    a = $(itemId + "Link").getElementsByTagName("a")[0];
    $(itemId).blindUp( { duration:0.3 } );
    a.className = "itemHead";
    var sc = activeFilter.getSearchCriteriaInstance(false);
    sc.setCriterionCategoryExpanded(itemId, false);
  }
  $('viewAllButton').focus();
};

activeFilter.showData = function( catId )
{
  var filterItemContainer = $(catId);
  var a = $(catId + "Link").getElementsByTagName("a")[0];
  var span = $(catId + "Link").getElementsByTagName("span")[0];
  var sc = activeFilter.getSearchCriteriaInstance(false);
  if ( filterItemContainer.style.display == "none" )
  {
    filterItemContainer.blindDown( { duration:0.3 } );
    a.className = "itemHead itemHeadOpen";
    span.innerHTML = page.bundle.getString("action.collapse") + " " ;
    sc.setCriterionCategoryExpanded(catId, true);
  }
  else
  {
    if ( filterItemContainer.style.display == "block" || filterItemContainer.style.display == "" )
    {
      filterItemContainer.blindUp( { duration:0.3 } );
      a.className = "itemHead";
      span.innerHTML = page.bundle.getString("action.expand") + " " ;
      sc.setCriterionCategoryExpanded(catId, false);
    }
  }
  /* Setting the focus to the link for JAWS to read*/
  (function() {
    try {
    a.focus();
    } catch (e)
    {
      // Ignore exceptions in case user opens/closes/opens/closes sections quickly
    }
   }.bind(this).delay(0.3));

  return false;
};

activeFilter.clearAll = function(reload)
{
  var sc = activeFilter.getSearchCriteriaInstance(false);
  var view = activeFilter.getViewInstance(false);
  // clear free form search
  var freeFormText = sc.getFreeFormMap();
  var fftCount = freeFormText.size();
  var textListItem = $s(view.buildId("textsearch", "list", view.FilteredItem));
  var afItem;
  if ( textListItem  )
  {
    textListItem.parentNode.removeChild(textListItem);
  }
  for ( var i = 0; i < fftCount; i++ )
  {
    var id = freeFormText.getValue(i);
    afItem = $s(view.buildId("textsearch", id, view.FilteredItem));
    if ( afItem )
    {
      afItem.parentNode.parentNode.removeChild(afItem.parentNode);
    }
    view.removeFreeFormTextItem("textsearch", id);
  }
  sc.removeAllFreeFormText();

  // clear selected search criteria
  var criterionCategories = sc.getCriterionCategories();
  var catCount = criterionCategories.size();
  for ( i = 0; i < catCount; i++ )
  {
    var catValue = criterionCategories.getValue(i);
    var critCount = catValue.getCriterionCount();
    for ( var j = 0; j < critCount; j++ )
    {
      var critValue = catValue.getCriterionValue(j);
      critValue.isSelected = false;
      afItem = $s(view.buildId(catValue.id, critValue.id, view.FilteredItem));
      if ( afItem )
      {
        afItem.parentNode.removeChild(afItem);
      }
      var browseItem = $s(view.buildId(catValue.id, critValue.id, view.CheckedItem));
      if ( browseItem )
      {
        browseItem.checked = false;
      }
    }
  }

  // clear inventory list
  var container = document.getElementById("filterItemContainer");
  if ( container )
  {
    container.parentNode.removeChild(container);
  }

  if ( reload )
  {
    sc.setResetToDefault('true');
    inventoryList.ajaxPostOnClick(null, activeFilter.listId);
  }
};

/**
  Criteria Summary UI flashes the criterion category that has changed.
  IE fails to execute morph function inline the calling function, therefore
  moved it to its own function..and then it works.
 */
activeFilter.preMorphFilteredCatItem = function(afItem)
{
  var item = $(afItem);
  if ( item )
  {
   //item.morph("color: #000; background: #66ff00");
	item.morph('receipt-highlight');
  }
};

/**
  Criteria Summary UI flashes the criterion category that has changed.
 */
activeFilter.morphFilteredCategoryItem = function(afItem)
{
  var item = $(afItem);
  if ( item )
  {
    //item.morph("color:#000;background:#fff");
	item.morph('receipt-default');
  }
};

// Add alert div for accessibility screen readers
activeFilter.alertSearchCriteriaChanged = function(id, catLabel, critLabel)
{
  var item = document.getElementById(id);
  var div = document.createElement("div");
  div.setAttribute("id", id + "alert");
  div.setAttribute("role", "alert");
  div.className = "hideoff";
  div.setAttribute("aria-live", "assertive");
  div.innerHTML =  catLabel + " " + JS_RESOURCES.getString("active.filter.changed.alert") + " " + critLabel;
  item.appendChild(div);
};

// Empty search, display no results message
activeFilter.checkAndDisplayNoItemText = function()
{
  var sc = activeFilter.getSearchCriteriaInstance(false);
  var criterionCategories = sc.getCriterionCategories();
  var catCount = criterionCategories.size();
  var aflist = $('aflist');
  var summaryHeader = $('summaryListLink');
  for ( var i = 0; i < catCount; i++ )
  {
    var catValue = criterionCategories.getValue(i);
    var critCount = catValue.getCriterionCount();
    for ( var j = 0; j < critCount; j++ )
    {
      var critValue = catValue.getCriterionValue(j);
      if ( critValue.isSelected )
      {
        aflist.style.display = "";
        if (summaryHeader)
        {
          summaryHeader.addClassName("hasActiveCriteria");
          summaryHeader.removeClassName("noActiveCriteria");
        }
        return;
      }
    }
  }
  // check for search text
  var textsearch = sc.getFreeFormMap();
  if ( textsearch.size() > 0 )
  {
    aflist.style.display = "";
    if (summaryHeader)
    {
      summaryHeader.addClassName("hasActiveCriteria");
      summaryHeader.removeClassName("noActiveCriteria");
    }
    return;
  }

  if ( aflist )
  {
    aflist.style.display = "none";
  }
  if (summaryHeader)
  {
    summaryHeader.removeClassName("hasActiveCriteria");
    summaryHeader.addClassName("noActiveCriteria");
  }
};

/**
  Add free form search text
 */
activeFilter.addTextSearch = function()
{
  var sc = activeFilter.getSearchCriteriaInstance(false);
  var keywordsField = $('keywords_field');
  var text = keywordsField.value;
  if ( !text )
  {
   alert( page.bundle.getString("active.filter.free.form.text.blank"));
    keywordsField.focus();
    return false;
  }
  // prevent duplicates
  if ( sc.getFreeFormMap().findValue(text) == -1 )
  {
    var id = (Math.round((Math.random() * 10000) + 1));
    sc.addFreeFormText(text, id);
    sc.getView().addLastChangedCatId("searchtext");
    inventoryList.ajaxPostOnClick(null, activeFilter.listId);
  }
  // reset free from text box
  if ( keywordsField )
  {
    keywordsField.value = "";
  }
};

/**
  Process new search criteria object
 */
activeFilter.updateSearchCriteria = function(inXml)
{
  var xmlDocument;
  var scXml = decodeURIComponent(inXml);
  try // IE
  {
    xmlDocument = new ActiveXObject( "Microsoft.XMLDOM" );
    xmlDocument.async = "false";
    xmlDocument.loadXML(scXml);
  }
  catch( e )
  {
    try // Mozilla
    {
      var parser = new DOMParser();
      xmlDocument = parser.parseFromString( scXml, "text/xml" );
    }
    catch( e2 )
    {
    }
  }

  var sc = activeFilter.getSearchCriteriaInstance(false);

  // need the prev set of filtered items
  var prevFilteredItems = sc.getView().getFilteredItems();
  var prevLastChangedCatId = sc.getView().getLastChangedCatId();
  var prevLastChangedCritId = sc.getView().getLastChangedCritId();

  // clear free form search from ui
  activeFilter.clearAll(false);

  // new Search Criteria
  sc = activeFilter.loadScXml(xmlDocument, true);

  // figure out which criteria categories of have changed
  sc.getView().addLastChangedCatId(prevLastChangedCatId);
  sc.getView().addLastChangedCritId(prevLastChangedCritId);
  activeFilter.processFilteredChanges(prevFilteredItems);

  // perform post initialization
  activeFilter.postInitialize();
};

/**
 * Determine which categories have changed so the criteria summary panel
 * 'flashes' appropriately
 */
activeFilter.processFilteredChanges = function(prevFilteredItems)
{
  var sc = activeFilter.getSearchCriteriaInstance(false);
  var view = sc.getView();

  // check filtered items for removal
  var filteredCount = prevFilteredItems.size();
  for ( var i = 0; i < filteredCount; i++ )
  {
    var item = prevFilteredItems.get(i);
    var catId = view.getCatId(item);
    var critId = view.getCritId(item);
    var critCat = sc.getCriterionCategory(catId);
    var criterion;
    if( critCat )
    {
      criterion = critCat.getCriterion(critId);
    }
    if ( ( !criterion || !criterion.isSelected ) && critCat )
    {
      sc.getCriterionCategory(catId).changed = true;
    }
  }

  // check filtered items for additions
  var criterionCategories = sc.getCriterionCategories();
  var catCount = criterionCategories.size();
  for ( i = 0; i < catCount; i++ )
  {
    var catValue = criterionCategories.getValue(i);
    var criterionCount = catValue.getCriterionCount();
    for ( var j = 0; j < criterionCount; j++ )
    {
      var critValue = catValue.getCriterionValue(j);
      if ( critValue.isSelected )
      {
        var id = view.buildId(catValue.id, critValue.id, view.FilteredItem);
        if ( prevFilteredItems.findKey(id) == -1 )
        {
          catValue.changed = true;
        }
      }
    }
  }
};

/**
   initialize active filter.
 */
activeFilter.initialize = function(listId, isInitialFocusOnTitleBar)
{
  activeFilter.listId = listId;
  
  // set initial page focus
  var objectToSetFocusOn = null;
  var receipt = $s( 'receipt_id' );
  var nestedReceipt = $s( 'receipt_nested_id' );
  if ( receipt != null )
  {
    objectToSetFocusOn = receipt;
  }
  else if ( nestedReceipt != null )
  {
    objectToSetFocusOn = nestedReceipt;
  }
  else if ( isInitialFocusOnTitleBar )
  {
    objectToSetFocusOn = $( 'pageTitleBar' );
  }
  if ( objectToSetFocusOn != null )
  {
    objectToSetFocusOn.tabIndex = 1;
    objectToSetFocusOn.focus();
  }
};

/**
 * process the search criteria xml
 */
activeFilter.loadScXml = function(xmlDocument, useNewSc)
{
  var sc = activeFilter.getSearchCriteriaInstance(useNewSc);
  var view = activeFilter.getViewInstance(false);
  var scDoc = xmlDocument.getElementsByTagName("sc")[0];
  var categories = scDoc.getElementsByTagName("category");
  var container = document.createElement("div");
  container.id = "filterItemContainer";

  // add criterion category
  for ( var i = 0; i < categories.length; i++ )
  {
    var catId = categories[i].getAttribute("id");
    var catExpanded = categories[i].getAttribute("expanded");
    var catFilterType = categories[i].getAttribute("filterType");
    var critCat = sc.getCriterionCategory(catId);
    var userDefault;

    if ( !critCat )
    {
      critCat = new activeFilter.criterionCategory();
      critCat.id = catId;
      critCat.isExpanded = catExpanded;
      critCat.filterType = catFilterType;
      if( critCat.filterType === "AUTOCOMPLETE" )
      {
        critCat.autoCompleteUrl = categories[i].getAttribute("autoCompleteUrl");
        critCat.textboxLabel = categories[i].getAttribute("textboxLabel");
      }

      var defaultCrit = categories[i].getElementsByTagName("userDefaultCriterion");

      if( defaultCrit[0] )
      {
        userDefault = defaultCrit[0].getAttribute("id");
        critCat.userDefault = userDefault;
      }

    }
    var filterContainerDiv = document.createElement("div");
    filterContainerDiv.className = "columnPalette";

    var autoCompleteAllUl = null;
    var autoCompleteTextboxDiv = null;
    if( critCat.filterType === "AUTOCOMPLETE" )
    {
      //Create the ul for the all item
      autoCompleteAllUl = document.createElement("ul");

      //Create the textbox controls
      autoCompleteTextboxDiv = document.createElement("div");

      var autoCompleteLabel = document.createElement("label");
      //Need to use writeAttribute since 'for' is a reserved word in JS.
      $(autoCompleteLabel).writeAttribute("for", "autocomplete_" + catId);
      autoCompleteLabel.innerHTML = critCat.textboxLabel;
      autoCompleteTextboxDiv.appendChild(autoCompleteLabel);

      autoCompleteTextboxDiv.appendChild(document.createElement("br"));

      var autoCompleteInput = document.createElement("input");
      autoCompleteInput.type = "text";
      autoCompleteInput.id = "autocomplete_" + catId;
      autoCompleteInput.name = "autocomplete_" + catId;
      autoCompleteTextboxDiv.appendChild(autoCompleteInput);
      var autoCompleteResultsDiv = document.createElement("div");
      autoCompleteResultsDiv.className = "autocomplete";
      autoCompleteResultsDiv.id = "autocomplete_" + catId + "_results";
      autoCompleteTextboxDiv.appendChild(autoCompleteResultsDiv);
    }

    var ul = document.createElement("ul");

    var catLabel = categories[i].getElementsByTagName("label")[0].firstChild.nodeValue;
    critCat.label = catLabel;
    var criteria = categories[i].getElementsByTagName("criterion");
    var headerh3 = document.createElement("h3");
    headerh3.id = catId + "Link";
    if ( catExpanded == "false" )
    {
      headerh3.innerHTML = "<a href='#' class='itemHead itemHeadClose' onclick='activeFilter.showData(\"" + catId + "\"); return false;'>" + "<span class=\"hideoff\">" + page.bundle.getString("action.expand")  + " </span>" + catLabel + "</a>";
    }
    else
    {
      headerh3.innerHTML = "<a href='#' class='itemHead itemHeadOpen' onclick='activeFilter.showData(\"" + catId + "\"); return false;'>" + "<span class=\"hideoff\">" + page.bundle.getString("action.collapse") + " </span> " + catLabel + "</a>";
    }

    var filterItemContainerDiv = document.createElement("div");
    filterItemContainerDiv.className = "paletteItems";
    filterItemContainerDiv.id = catId;
    if ( catExpanded == "false" )
    {
      filterItemContainerDiv.style.display = "none";
    }
    // add criterion per criterion category
    for ( var j = 0; j < criteria.length; j++ )
    {
      var criteriaId = criteria[j].getElementsByTagName("id")[0].firstChild.nodeValue;
      var criteriaSelectable = criteria[j].getAttribute("isSelectable");
      var criteriaSelected = criteria[j].getAttribute("selected");
      var criteriaExclusiveWhenSelected = criteria[j].getAttribute("exclusive");
      var criteriaLabel = criteria[j].getElementsByTagName("label")[0].firstChild.nodeValue;

      var crit = critCat.getCriterion(criteriaId);

      if ( !crit )
      {
        crit = new activeFilter.Criterion();
        crit.id = criteriaId;
        crit.label = criteriaLabel;
        crit.isSelectable = ( criteriaSelectable === "false" ) ? false : true;
        crit.isSelected = ( criteriaSelected === "false" ) ? false : true;
        crit.exclusiveWhenSelected = ( criteriaExclusiveWhenSelected === "false" ) ? false : true;
        critCat.addCriterion(crit);
      }

      var checkId = view.buildId(catId, criteriaId, view.CheckedItem);
      var li = document.createElement("li");
      li.id = view.buildId(catId, criteriaId, view.ListItem) + "li";

      if ( crit.isSelected )
      {
        li.className = "selectedItem";
        sc.getView().addFilteredItem(catId, criteriaId);
      }

      if( !crit.isSelectable )
      {
        li.innerHTML = crit.label;
      }
      else
      {
        if( crit.exclusiveWhenSelected )
        {
          //Added the onFocus and onBlur to highlight the list element when accessed through tab key.
          li.innerHTML = "<label for='" + checkId + "'>" + criteriaLabel + "</label><input type=\"radio\" class=\"filterCheck\" name=\"" + catId + "_" + criteriaId + "\" id=\"" + checkId + "\"" + " value=\"\" onclick=\"activeFilter.updateFilter('" + catId + "', '" + criteriaId + "');\"" +
            "onFocus=\"activeFilter.setFocus('" + catId + "', '" + li.id + "')\"" +
            "onBlur=\"activeFilter.removeFocus('" + li.id + "')\">";
        }
        else
        {
          li.innerHTML = "<label for='" + checkId + "'>" + criteriaLabel + "</label><input type=\"checkbox\" class=\"filterCheck\" name=\"" + catId + "_" + criteriaId + "\" id=\"" + checkId + "\"" + " value=\"\" onclick=\"activeFilter.updateFilter('" + catId + "', '" + criteriaId + "');\"" +
          "onFocus=\"activeFilter.setFocus('" + catId + "', '" + li.id + "')\"" +
          "onBlur=\"activeFilter.removeFocus('" + li.id + "')\">";
        }
      }

      if( j === 0 && critCat.filterType === "AUTOCOMPLETE" )
      {
        autoCompleteAllUl.appendChild(li);
      }
      else
      {
        ul.appendChild(li);
      }
    }
    filterContainerDiv.appendChild(headerh3);
    if ( autoCompleteTextboxDiv !== null )
    {
      filterItemContainerDiv.appendChild( autoCompleteAllUl );
      filterItemContainerDiv.appendChild( autoCompleteTextboxDiv );
    }
    filterItemContainerDiv.appendChild(ul);
    filterContainerDiv.appendChild(filterItemContainerDiv);
    container.appendChild(filterContainerDiv);

    sc.addCriterionCategory(critCat);
  }

  var allFilterItems = $('allFilterItems');
  if ( allFilterItems )
  {
    allFilterItems.appendChild(container);
  }

  for( i = 0; i < sc.getCriterionCategories().size(); i++ )
  {
    if( sc.getCriterionCategories().getValue(i).filterType === "AUTOCOMPLETE" )
    {
      var autoCompleter = new Ajax.Autocompleter( "autocomplete_" + sc.getCriterionCategories().getValue(i).id, "autocomplete_" + sc.getCriterionCategories().getValue(i).id + "_results", sc.getCriterionCategories().getValue(i).autoCompleteUrl,
                                                 { afterUpdateElement : this.autoCompleteSelected, enableAria : true, ariaOwns : "autocomplete_" + sc.getCriterionCategories().getValue(i).id + "_resultsList" } );
    }
  }

  // add (pre-existing) free form text to filter
  var freeFormText = scDoc.getElementsByTagName("freetext");
  var freeFormTextElements = freeFormText[0].getElementsByTagName("sel");
  for ( i = 0; i < freeFormTextElements.length; i++ )
  {
    var text = freeFormTextElements[i].firstChild.nodeValue;
    if ( sc.getFreeFormMap().findValue(text) == -1 )
    {
      var id = (Math.round((Math.random() * 10000) + 1));
      sc.addFreeFormText(text, id);
      var anc = document.createElement("a");
      anc.href = "#";
      if ( !Prototype.Browser.IE )
      {
        anc.setAttribute("onclick", "activeFilter.removeTextSearch('" + id + "'); return false;");
      }
      else
      {
        anc.setAttribute("textId", id);
        anc.onclick = activeFilter.onClickRemoveText;
      }
      anc.appendChild(document.createTextNode(text));
      view.addFreeFormTextItem("textsearch", id, anc);
    }
  }

  var resetElement = scDoc.getElementsByTagName("reset");
  var reset = resetElement[0].firstChild.nodeValue;
  return sc;
};

activeFilter.autoCompleteSelected = function( text, li )
{
  //Clear the textbox so we can search another.
  text.value = "";

  //The id of the textbox is "autocomplete_" + catId, so we can get the catId
  //from the end.
  var catId = text.id.substr(13);
  var critId = li.id;
  var critLabel = li.innerHTML;
  activeFilter.updateFilter( catId, critId );
};

/**
 * Sets the focus on the current list element when accessed through tab key.
 */
activeFilter.setFocus = function(listId, listElementId)
{
  var ul = $(listId);
  var li = $(listElementId);
  var listElements = ul.getElementsByTagName("li");
  for(var i = 0; i < listElements.length; i++)
  {
    listElements[i].removeClassName("focus");
  }
  li.addClassName("focus");
  return false;
};

/**
 * Removes the focus.
 */
activeFilter.removeFocus = function(listElementId)
{
  var li = $(listElementId);
  li.removeClassName("focus");
  return false;
};

activeFilter.onClickRemoveText = function() {
  activeFilter.removeTextSearch(this.getAttribute("textId"));
  return false;
};

/**
 * Complete active filter rendering.
 */
activeFilter.postInitialize = function()
{
  var sc = activeFilter.getSearchCriteriaInstance(false);
  var view = activeFilter.getViewInstance(false);
  var criterionCategories = sc.getCriterionCategories();
  var catCount = criterionCategories.size();
  var item;
  for ( var i = 0; i < catCount; i++ )
  {
    var catValue = criterionCategories.getValue(i);
    var critCount = catValue.getCriterionCount();
    var userDefault;
    if( catValue.userDefault )
    {
      userDefault = catValue.userDefault;
    }
    item = document.createElement("li");
    var firstCriterion = true;
    var addItem = false;
    for ( var j = 0; j < critCount; j++ )
    {
      var critValue = catValue.getCriterionValue(j);
      if ( critValue.isSelected )
      {
        addItem = true;
        var itemId = $(view.buildId(catValue.id, critValue.id, view.CheckedItem));
        var span;
        if ( firstCriterion )
        {
          // add category label to search criteria summary.
          item.id = view.buildId(catValue.id, critValue.id, view.FilteredItem);
          item.className = "clearfix";
         // item.style.color = "rgb(0, 0, 0)";
         /// item.style.backgroundColor = "rgb(255, 255, 255)";
          item.innerHTML = "<strong>" + catValue.label + " </strong>";
          itemId.checked = true;
          span = document.createElement("span");
          span.innerHTML = critValue.label;
          span.title = critValue.label;
          item.title = span.title;
          firstCriterion = false;
        }
        else
        {
          itemId.checked = true;
          item.innerHTML = item.innerHTML;
          span = document.createElement("span");
          span.innerHTML = critValue.label;
          span.title = critValue.label;
          item.title = item.title + " , " + span.title;
          item.appendChild(span);
        }
        item.appendChild(span);

        $("aflist").appendChild(item);
      }
    } //end loop over criteria
    if ( catValue.changed || sc.getView().getLastChangedCatId() == catValue.id )
    {
      if ( item.id.length > 0 )
      {
        activeFilter.preMorphFilteredCatItem(item.id);
        setTimeout("activeFilter.morphFilteredCategoryItem('" + item.id + "')", 1000);
        activeFilter.alertSearchCriteriaChanged(item.id, catValue.label, item.title);
      }
    }

    //add event notification for post rendering modifications
    document.fire( "bb:activeFilterCallback" );
  }

  // free form text search
  var viewItems = view.getFreeFormTextItems();
  var itemCount = viewItems.size();
  if ( itemCount > 0 )
  {
    item = document.createElement("li");
    item.id = view.buildId("textsearch", "list", view.FilteredItem);
   item.className = "clearfix";
   // item.style.color = "rgb(0, 0, 0)";
   // item.style.backgroundColor = "rgb(255, 255, 255)";
    item.innerHTML = "<strong>" + JS_RESOURCES.getString("active.filter.search.terms") + " </strong>";
    $("aflist").appendChild(item);
  }
  var listOfTerms = "";
  for ( i = 0; i < itemCount; i++ )
  {
    var value = viewItems.getValue(i);
    item.appendChild(value);
    listOfTerms = listOfTerms + " " +value.firstChild.nodeValue;
  }
  if ( sc.getView().getLastChangedCatId() == "searchtext" )
  {
    var textSearchElement = view.buildId("textsearch", "list", view.FilteredItem);
    if ( $(textSearchElement) )
    {
      activeFilter.alertSearchCriteriaChanged(textSearchElement, JS_RESOURCES.getString("active.filter.search.terms"), listOfTerms);
      activeFilter.preMorphFilteredCatItem(textSearchElement);
      setTimeout("activeFilter.morphFilteredCategoryItem('" + textSearchElement + "')", 1000);
    }
  }

  activeFilter.reapplyFocus();

  // reset last changed category/criterion id
  sc.getView().addLastChangedCatId("");
  sc.getView().addLastChangedCritId("");

  activeFilter.checkAndDisplayNoItemText();
};

//Since the filters are destroyed and rebuilt each time a filter is interacted
//with, we need to set focus back on or near the control that was changed, otherwise
//the focus is pushed way back up in the dom and the user has to tab alot
//to get back to where they were.
activeFilter.reapplyFocus = function()
{
  var sc = activeFilter.getSearchCriteriaInstance(false);
  var view = sc.getView();
  var catId = view.getLastChangedCatId();
  var critId = view.getLastChangedCritId();

  //We only need to set focus if we have the information
  //we need to do so.
  if( catId !== "" && critId !== "" )
  {
    var filterType = sc.getCriterionCategory(catId).filterType;
    var filterControlId;
    if( filterType === "AUTOCOMPLETE" )
    {
      //For an auto-complete filter type, we always set focus on the textbox
      //since when adding auto-complete filters, it will be easier to add multiple,
      //and when removing them, the filterControlId would not be found
      //for that checkbox anyway.
      filterControlId = "autocomplete_" + catId;
    }
    else
    {
      filterControlId = view.buildId( catId, critId, view.CheckedItem );
    }

    var controlObj = $( filterControlId );
    if( controlObj )
    {
      controlObj.focus();
    }
  }

};

/**
 * Remove free form text from search criteria and update search.
 */
activeFilter.removeTextSearch = function(id)
{
  var sc = activeFilter.getSearchCriteriaInstance(false);
  var view = activeFilter.getViewInstance(false);
  var text = sc.getFreeFormMap().findKey(id);
  var afItem = $s(view.buildId("textsearch", id, view.FilteredItem));
  if ( afItem )
  {
    afItem.parentNode.parentNode.removeChild(afItem.parentNode);
  }

  sc.removeFreeFormText(text);
  view.removeFreeFormTextItem("textsearch", id);
  inventoryList.ajaxPostOnClick(null, activeFilter.listId);
  activeFilter.checkAndDisplayNoItemText();

  sc.getView().addLastChangedCatId("searchtext");
};

/**
 * Processes active filter change.  Request new search result given the updated filter.
 */
activeFilter.updateFilter = function(catId, criteriaId )
{

  var sc = activeFilter.getSearchCriteriaInstance(false);
  var view = activeFilter.getViewInstance(false);

  // criterion category
  var critCat = sc.getCriterionCategory(catId);
  if ( !critCat )
  {
    critCat = new activeFilter.criterionCategory();
    critCat.id = catId;
  }

  // criterion
  var crit = critCat.getCriterion(criteriaId);
  if ( !crit )
  {
    crit = new activeFilter.Criterion();
    crit.id = criteriaId;
    critCat.addCriterion( crit );
  }

  //A radio button that is selected should NOT remain selected, a checkbox that is selected
  //should be toggled to not selected.  IF you want a radio button to work differently
  // then you'll have to add custom logic specific to your use case because the default
  // behavior for a radio button in the discover interface is to act just like a
  // checkbox (toggle on/off) but visually look like a radio button.
  if ( !crit.isSelected )
  {
    crit.isSelected = true;
    sc.getView().addFilteredItem(catId, criteriaId);
  }
  else
  {
    crit.isSelected = false;
    sc.getView().removeFilteredItem(catId, criteriaId);
  }

  sc.getView().addLastChangedCritId(criteriaId);
  sc.getView().addLastChangedCatId(catId);

  var critCount = critCat.getCriterionCount();
  for ( var j = 0; j < critCount; j++ )
  {
    var critValue = critCat.getCriterionValue(j);
    if ( critValue.id == crit.id || !critValue.isSelected )
    {
      continue;
    }
    if ( crit.exclusiveWhenSelected || ( !crit.exclusiveWhenSelected && critValue.exclusiveWhenSelected ) )
    {
      critValue.isSelected = false;
      sc.getView().removeFilteredItem(catId, criteriaId);
      var afItem = $s(view.buildId(critCat.id, crit.id, view.FilteredItem));
      if ( afItem )
      {
        afItem.parentNode.removeChild(afItem);
      }
      var browseItem = $(view.buildId(critCat.id, crit.id, view.CheckedItem));
      if ( browseItem )
      {
        browseItem.checked = false;
      }
    }
  }

  inventoryList.ajaxPostOnClick(null, activeFilter.listId);
  activeFilter.checkAndDisplayNoItemText();
};

/**
 * Returns the search criterion instance
 */
activeFilter.getSearchCriteriaInstance = function(useNewInstance)
{
  if ( useNewInstance || !activeFilter.instance )
  {
    activeFilter.instance = new activeFilter.searchCriteria();
  }
  return activeFilter.instance;
};

activeFilter.getViewInstance = function(useNewInstance)
{
  if ( useNewInstance || !activeFilter.viewInstance )
  {
    activeFilter.viewInstance = new activeFilter.View();
  }
  return activeFilter.viewInstance;
};

activeFilter.View.prototype =
{
  initialize: function()
  {
    this.FilteredItem = "FilteredItem";
    this.CheckedItem = "CheckedItem";
    this.ListItem = "ListItem";
    this.freeFormTextItems = new activeFilter.Map();
    this.lastChangedCatId = "";
    this.lastChangedCritId = "";
    this.filteredItems = new activeFilter.Map();
  },
  addLastChangedCatId: function(catId)
  {
    this.lastChangedCatId = catId;
  },
  getLastChangedCatId: function()
  {
    return this.lastChangedCatId;
  },
  addLastChangedCritId: function(critId)
  {
    this.lastChangedCritId = critId;
  },
  getLastChangedCritId: function()
  {
    return this.lastChangedCritId;
  },
  addFilteredItem: function(catId, critId)
  {
    this.filteredItems.add(this.filteredItems.size(), this.buildId(catId, critId, this.FilteredItem));
  },
  getFilteredItems: function()
  {
    return this.filteredItems;
  },
  removeFilteredItem: function(catId, critId)
  {
    this.filteredItems.remove(this.buildId(catId, critId, this.FilteredItem));
  },
  clearFilteredItems: function()
  {
    this.filteredItems.clear();
  },
  addFreeFormTextItem: function(catId, critId, item)
  {
    this.freeFormTextItems.add(this.buildId(catId, critId, this.FilteredItem), item);
  },
  getFreeFormTextItems: function()
  {
    return this.freeFormTextItems;
  },
  removeFreeFormTextItem: function(catId, critId)
  {
    this.freeFormTextItems.remove(this.buildId(catId, critId, this.FilteredItem));
  },
  buildId: function(catId, critId, type)
  {
    return catId + "@@" + critId + "@@" + type;
  },
  getCatId: function(stringId)
  {
    var stringArray = stringId.split("@@");
    return stringArray[0];
  },
  getCritId: function(stringId)
  {
    var stringArray = stringId.split("@@");
    return stringArray[1];
  },
  getType: function(stringId)
  {
    var stringArray = stringId.split("@@");
    return stringArray[2];
  }
};

/**
 * Criterion Object
 */
activeFilter.Criterion.prototype =
{
  initialize: function()
  {
    this.id = "";
    this.label = "";
    this.isSelectable = true;
    this.isSelected = false;
    this.exclusiveWhenSelected = false;
  }
};

/**
 * Criterion Category Object
 */
activeFilter.criterionCategory.prototype =
{
  initialize: function()
  {
    this.id = "";
    this.isExpanded = false;
    this.label = "";
    this.changed = false;
    this.filterType = "";
    this.criterionData = new activeFilter.Map();
  },
  addCriterion: function(criterion)
  {
    this.criterionData.add(criterion.id, criterion);
  },
  removeCriterion: function(criterion)
  {
    this.criterionData.remove(criterion.id);
  },
  getCriterion: function(criterionId)
  {
    return this.criterionData.get(criterionId);
  },
  getCriterionValue: function(index)
  {
    return this.criterionData.getValue(index);
  },
  getCriterionCount: function()
  {
    return this.criterionData.size();
  }
};

/**
 * Search Criteria object
 */
activeFilter.searchCriteria.prototype =
{
  initialize: function()
  {
    this.isExpanded = true;
    this.freeFormTextMap = new activeFilter.Map();
    this.criterionCategories = new activeFilter.Map();
    this.view = new activeFilter.View();
    this.reset = 'false';
  },
  getView: function()
  {
    return this.view;
  },
  addFreeFormText: function(key, value)
  {
    this.freeFormTextMap.add(key, value);
  },
  getFreeFormMap: function()
  {
    return this.freeFormTextMap;
  },
  removeFreeFormText: function(id)
  {
    this.freeFormTextMap.remove(id);
  },
  removeAllFreeFormText: function()
  {
    this.freeFormTextMap.clear();
  },
  addCriterionCategory: function(cat)
  {
    this.criterionCategories.add(cat.id, cat);
  },
  getCriterionCategory: function(criterionCategoryId)
  {
    return this.criterionCategories.get(criterionCategoryId);
  },
  getCriterionCategories: function()
  {
    return this.criterionCategories;
  },
  findCriterionCategory: function(criterionCategoryId)
  {
    if ( !this.criterionCategoryKeys )
    {
      return -1;
    }
    for ( var i = 0; i < this.criterionCategoryKeys.length; i++)
    {
      if ( this.criterionCategoryKeys[i] == criterionCategoryId )
      {
        return i;
      }
    }
    return -1;
  },
  setCriterionCategoryExpanded: function(criterionCategoryId, isExpanded)
  {
    var criterionCategory = this.getCriterionCategory(criterionCategoryId);
    if ( criterionCategory )
    {
      criterionCategory.isExpanded = isExpanded;
      this.addCriterionCategory(criterionCategory);
    }
  },
  setResetToDefault: function(resetValue)
  {
    this.reset = resetValue;
  },
  getSearchCriteriaAsXml: function()
  {
    var catCount = this.criterionCategories.size();
    var size = "";
    var searchCriteria = "<sc>";
    for ( var i = 0; i < catCount; i++ )
    {
      var catValue = this.criterionCategories.getValue(i);
      searchCriteria = searchCriteria + "<category id='" + catValue.id + "' expanded='" + catValue.isExpanded + "' filterType='" + catValue.filterType +"'>";

      var critCount = catValue.getCriterionCount();
      for ( var j = 0; j < critCount; j++ )
      {
        var critValue = catValue.getCriterionValue(j);
        if ( critValue.isSelected )
        {
          searchCriteria = searchCriteria + "<sel><![CDATA[" + critValue.id + "]]></sel>";
        }
      }
      searchCriteria = searchCriteria + "</category>";
    }
    searchCriteria = searchCriteria + "<freetext>";
    var textCount = this.freeFormTextMap.size();
    for ( var k = 0; k < textCount; k++ )
    {
      searchCriteria = searchCriteria + "<sel>" + this.freeFormTextMap.getKey(k) + "</sel>";
    }
    searchCriteria = searchCriteria + "</freetext>";
    searchCriteria = searchCriteria + "<reset>";
    searchCriteria = searchCriteria + this.reset;
    searchCriteria = searchCriteria + "</reset>";
    searchCriteria = searchCriteria + "</sc>";
    return searchCriteria;
  }
};

/**
 * Generic Mapping object.  Can be replaced with a 'well-known' mapping utility (if exist?)
 */
activeFilter.Map.prototype =
{
  initialize: function()
  {
    this.keys = [];
    this.values = [];
  },
  add: function(key, value)
  {
    var index = this.findValue(key);
    if ( index == -1 )
    {
      this.keys.push(key);
      this.values.push(value);
    }
    else
    {
      this.values[index] = value;
    }
  },
  get: function(key)
  {
    for ( var i = 0; i < this.keys.length; i++ )
    {
      if ( this.keys[i] == key )
      {
        return this.values[i];
      }
    }
    return undefined;
  },
  remove: function(key)
  {
    for ( var i = 0; i < this.keys.length; i++ )
    {
      if ( this.keys[i] == key )
      {
        this.keys.splice(i, 1);
        this.values.splice(i, 1);
      }
    }
  },
  clear: function()
  {
    this.keys.clear();
    this.values.clear();
  },
  getKey: function(index)
  {
    return this.keys[index];
  },
  getValue: function(index)
  {
    return this.values[index];
  },
  getValues: function()
  {
    return this.values;
  },
  findValue: function(key)
  {
    for ( var i = 0; i < this.keys.length; i++ )
    {
      if ( this.keys[i] == key )
      {
        return this.values[i];
      }
    }
    return -1;
  },
  findKey: function(value)
  {
    for ( var i = 0; i < this.values.length; i++ )
    {
      if ( this.values[i] == value )
      {
        return this.keys[i];
      }
    }
    return -1;
  },
  size: function()
  {
    return this.keys.length;
  }
};
}