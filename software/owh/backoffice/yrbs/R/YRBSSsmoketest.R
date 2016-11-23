###################################################
# Some test cases -- just a smoke test.
###################################################


rda.path = "C:/Users/Rex/Desktop/OWH/owh-ds/software/owh/backoffice/yrbs/rda/"
load(paste0(rda.path,"sadc_2015_national.rda"))
kolumns = colnames(sadc.2015.national.df)
#cat(kolumns)
odd = c(1,3,5,7,9)
gc()

### These just check that we can load the appropriate state and year, and return
### an error message if not.
dim.l.y = function(state,year) nrow(get.df.for.state.and.year(state,year,rda.path))    
print(dim.l.y('XX', 2015))
print(dim.l.y('XX', 2011))
print(dim.l.y('XX', 2009))
print(dim.l.y('MT', 2015))
print(dim.l.y('MT', 2011))
print(dim.l.y('MT', 2009))
print(dim.l.y('NC', 2015))
print(dim.l.y('NC', 2011))
print(dim.l.y('NC', 2009))
print(get.df.for.state.and.year('MT', 1909, rda.path))
gc()
    
      
### These are just a smoke test of yrbssCalculate.  Arguments that would normally be passed are
### allowed to default.
cat('\n\n', yrbssCalculate(filter=list(q8=1:2)) )
cat('\n\n', yrbssCalculate(filter=list(q8=1:2), state='MT', year = 2011) )
cat('\n\n', yrbssCalculate(filter=list(q8=1:2), state='MM', year = 2011) )
cat('\n\n', yrbssCalculate(filter=list(q9=c(1,3,5))) )
cat('\n\n', yrbssCalculate(filter=list(q8=1:2, q9=c(1,3,5))) )
cat('\n\n', yrbssCalculate(filter=list(q1=c(4, 5, 6), # age 15-18
                            q2=c(1), # female
                            q5=c("C","E")))) # bogus
cat('\n\n', yrbssCalculate(filter=list(queue8=1:2)) )  
    
### These examples illustrate caching.  We cache a dataframe for Montana/2011
### and use it twice.  Third time we get an error.
df.MT.2011 = get.df.for.state.and.year('MT',2011,rda.path)
cat('\n\n', yrbssCalculate(filter=list(q8=1:2), state='MT', year = 2011, df=df.MT.2011) )
cat('\n\n', yrbssCalculate(filter=list(q9=odd), state='MT', year = 2011, df=df.MT.2011) )
cat('\n\n', yrbssCalculate(filter=list(q8=1:2), state='MS', year = 2013, df=df.MT.2011) )
