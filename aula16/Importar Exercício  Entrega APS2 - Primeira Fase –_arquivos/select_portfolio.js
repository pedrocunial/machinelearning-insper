var select_portfolio = {};


select_portfolio.cancel = function()
{
  lightbox.closeCurrentLightbox();
};

select_portfolio.pickPortfolio = function( prefix )
{
  // 'ckbox' is the name of the listRadioElement we have in our inventoryList
  var portArray = $$('input[type="radio"][name="ckbox"]');
  if(portArray.length > 0)
  {
    portArray._each(function(portfolio) {
      if(portfolio.checked)
      {
        var selectedPortId = portfolio.value;
        var rowLink = portfolio.up(0).next('th').down('a');
        var name = '';
        var href = '';
        if( rowLink )
        {
          name = rowLink.innerHTML;
          href = rowLink.href;
        }
        else //no html link to portfolio so just get the text which is the name of portfolio
        {
          name = portfolio.up(0).next('th').down().innerHTML;
        }
        
        //pass the selected portfolioId, the link to its preview and the name of the selected portfolio plus the prefix for the bbPortfolio div
        PortfolioPicker.setSelectedPortfolio(selectedPortId, name, href, prefix);
        lightbox.closeCurrentLightbox();  
      }
    });
  }
};


