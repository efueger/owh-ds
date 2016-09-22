Feature: Mortality page
  As a user
  I should be able to access mortality page
  I want to see labels on X and Y axis on the quick visualization
  So that I can instantly know what data is plotted on which axis

Scenario: Access mortality page
  When I am at home page
  And  I click on Explore button in Quick Health Data Online section
  Then I should get search page with default filter type mortality

Scenario: Axis labels
  When user sees a visualization
  Then labels are displayed on both the axes for minimized visualization
  When user expand visualization
  Then labels are displayed on both the axes for expanded visualization

Scenario: Side filter collapse
  Given user is on search page
  When user sees side filter
  Then there is button to hide filter
  When user clicks hide filter button
  Then side menu slides away
