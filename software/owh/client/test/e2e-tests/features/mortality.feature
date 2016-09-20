Feature: Mortality page
  As a user
  I should be able to access mortality page
  I want to see legends on X and Y axis on the quick visualizations
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