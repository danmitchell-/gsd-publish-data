(function() {
  "use strict";
  window.GOVUK = window.GOVUK || {};

  function CollapsibleCollection(options){
    this.collapsibles = {};

    this.$container = options.$el;
    var depth = this.$container.data('collapse-depth');
    if(typeof depth == 'undefined'){
      depth = 1;
    }

    this.collapseSelector = "h"+(depth+1);
    this.superiorsSelector = this.calculateSuperiorsSelector(depth);
    this.markupSections();
    this.$sections = this.$container.find('.js-openable');

    if(this.$sections.length > 0) {
      this.$sections.each(this.initCollapsible.bind(this));
      this.$openAll = $("<a href='#' aria-hidden=true id='js-open-all'>Open all</a>"),
      this.$closeAll = $("<a href='#' aria-hidden=true id='js-close-all'>Close all</a>");
      this.addControls();

      this.closeAll();

      var openSectionID = GOVUK.getCurrentLocation().hash.substr(1);
      if(typeof(this.collapsibles[openSectionID]) != 'undefined') {
        this.collapsibles[openSectionID].open();
      }

      this.$container.on('click', 'a[rel="footnote"]', this.expandFootnotes.bind(this));
    }
  }

  CollapsibleCollection.prototype.initCollapsible = function initCollapsible(sectionIndex){
    var $section = $(this.$sections[sectionIndex]);
    var collapsible = new GOVUK.Collapsible($section);
    var sectionID = $section.find('.js-subsection-title').data('section-id');

    if(typeof sectionID == "undefined"){
      sectionID = sectionIndex;
    }

    $section.on('click', this.updateControls.bind(this));
    this.collapsibles[sectionID] = collapsible;
  }

  CollapsibleCollection.prototype.expandFootnotes = function expandFootnotes(){
    this.collapsibles['footnotes'].open();
  }

  CollapsibleCollection.prototype.markupSections = function markupSections(){
    // Pull out h2's and mark them up as js-subsection-title.
    // Mark all following tags up to the next h2 as js-subsection-body.
    // Wrap newly discovered sections in a div with js-openable and manual-subsection classes
    // The DOM now contains poperly marked up sections to which collapsible functions can attach.

    var subsectionHeaders = this.$container.find(this.collapseSelector);
    subsectionHeaders.addClass('js-subsection-title');

    subsectionHeaders.each(function(index, el){
      var $subsectionHeader = $(el),
          subsectionId = $subsectionHeader.attr('id');

      if (subsectionId) {
        $subsectionHeader.data('section-id', subsectionId);
      }

      var subsectionBody = $subsectionHeader.nextUntil(this.superiorsSelector);
      subsectionBody.andSelf().wrapAll('<div class="js-openable"></div>');
      subsectionBody.wrapAll('<div class="js-subsection-body body-content-wrapper"></div>');
    }.bind(this));
  }

  CollapsibleCollection.prototype.calculateSuperiorsSelector = function calculateSuperiorsSelector(depth){
    // Returns a string with this header and all the headers of higher priority, for example 'h2,h1' (depth is zero offset)

    var selector = '';
    var hValue = depth+1;

    while(hValue > 0) {
      selector += 'h'+hValue+',';
      hValue=hValue-1;
    }
    selector = selector.slice(0,-1);
    return selector;
  }

  CollapsibleCollection.prototype.closeAll = function closeAll(event){
    for (var section in this.collapsibles) {
      this.collapsibles[section].close();
    }

    this.disableControl(this.$closeAll);
    this.enableControl(this.$openAll);

    if (typeof event != 'undefined'){
      event.preventDefault();
    }
  }

  CollapsibleCollection.prototype.openAll = function openAll(event){
    for (var section in this.collapsibles) {
      this.collapsibles[section].open();
    }

    this.disableControl(this.$openAll);
    this.enableControl(this.$closeAll);

    if (typeof event != 'undefined'){
      event.preventDefault();
    }
  }

  CollapsibleCollection.prototype.addControls = function addControls(){
    var $collectionControlsWrap = $('<div class="js-title-controls-wrap"/>');
    var $collectionControls = $('<div class="js-collection-controls" />');
    $collectionControls.append(this.$openAll, this.$closeAll);
    $collectionControlsWrap.append($collectionControls);

    // The Updates pages have a title for each collapsible section (they're sorted by year), include this if it's there
    var $title = this.$container.find($('.section-title'));
    if ($title.length) {
      $collectionControlsWrap.prepend($title);
    }

    this.$container.prepend($collectionControlsWrap);
    this.$openAll.on('click', this.openAll.bind(this));
    this.$closeAll.on('click', this.closeAll.bind(this));
  }

  CollapsibleCollection.prototype.updateControls = function updateControls(){
    // if all the sections in this collection are open
    var sectionCount = this.$sections.length;
    var closedCount = this.$container.find('.closed').length;

    if (closedCount == 0) {
      // all the sections are open
      this.disableControl(this.$openAll);
      this.enableControl(this.$closeAll);

    } else if (sectionCount == closedCount) {
      // all the sections are closed
      this.disableControl(this.$closeAll);
      this.enableControl(this.$openAll);

    } else {
      this.enableControl(this.$openAll);
      this.enableControl(this.$closeAll);
    }
  }

  CollapsibleCollection.prototype.disableControl = function disableControl(control){
    control.addClass('disabled');
  }

  CollapsibleCollection.prototype.enableControl = function enableControl(control){
    control.removeClass('disabled');
  }

  GOVUK.CollapsibleCollection = CollapsibleCollection;
}());
