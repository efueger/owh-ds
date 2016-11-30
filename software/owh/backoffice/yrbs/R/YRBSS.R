########################################################################################
### Use Thomas Lumley's 'survey' package, as enhanced for us by Prof. T.L. himself.
### The package is described in his book 
###     Complex Surveys: A Guide to Analysis Using R (Wiley, 2010)
########################################################################################

library("survey")

########################################################################################
### This takes the result of svyciprop and turns it into a simple vector
########################################################################################
tidyresult = function(res) {
    foo = c(mean(res),SE(res), confint(res))
    names(foo)  = NULL
    foo
}
    
#########################################################################################
### This puts a vector into string form.  I bet there is an R function that does this.
#########################################################################################
cc = function(v) {
    s = paste0("c(",v[1])
    v = v[-1]
    for (x in v) s = paste0(s,",",x)
    return(paste0(s,")"))
}

#########################################################################################
### This gets a dataframe containing just the year and state (or all US=XX) we are
### interested in.  There are three "big files", and we must first choose which file.
### We load a data frame from that file, then subset for state and year.
### The results of this function can be cached and used to call yrbssCalculate.
#########################################################################################
get.df.for.state.and.year = function(state, year.we.want, rda.path) {
    df = NULL
    if (state == 'XX') {
        load(paste0(rda.path,"sadc_2015_national.rda"))
        df = sadc.2015.national.df
    } else if (state <= 'MZ') {
        load(paste0(rda.path,"sadc_2015_state_a_m.rda"))
        df = sadc.2015.state.a.m.df
    } else {
        load(paste0(rda.path,"sadc_2015_state_n_z.rda"))
        df = sadc.2015.state.n.z.df
    }
    if (class(df) != 'data.frame') return("ERROR: Internal error: Missing/bad dataframe!")

    df = subset(df, df$sitecode == state)
    if (nrow(df)==0)  {
        return(paste0("ERROR: No data for state ",state,"!"))
    }
    #print(dim(df)) 

    df = subset(df, df$year == year.we.want)
    if (nrow(df)==0)  {
        return(paste0("ERROR: No data for state ",state," and year ",year.we.want,"!"))
    }
    #print(dim(df))

    return(df)
}
    


#########################################################################################
### This is called by yrbssCalculate.
### Given a filter criterion and a data frame, it computes a boolean vector that selects
### the desired rows from the dataframe.
#########################################################################################
construct.mask.from.filter = function(df, filter) {
    mask = TRUE
    for (var in names(filter)) {
        mask = mask & (df[[var]] %in% filter[[var]])
    }
    return(mask)
}

#########################################################################################
### This one verifies that the dataframe contains exactly state and year we are interested
### in.  It is used when yrbssCaculate is called with a cached dataframe.
#########################################################################################
verify.df = function(df, state, year.we.want) {
    states = unique(df$sitecode)
    if ((length(states) > 1) || states != state) {
        return(paste0("ERROR: df contains data for states other than ", state))
    }
    years = unique(df$year)
    if ((length(years) > 1) || years != year.we.want) {
        return(paste0("ERROR: df contains data for years other than ", year.we.want))
    }
    return(df)
}


#########################################################################################
### This is the main function.
#########################################################################################
yrbssCalculate =
  function (
    ### The default values are mostly just random examples.
    state = 'XX',   # XX=national, otherwise AL, AK, IN, NC, MT, etc.
    year = '2015',
    # directory where files are located, if not passing cached df:
    rda.path = "C:/Users/Rex/Desktop/OWH/owh-ds/software/owh/backoffice/yrbs/rda/",  
    # Dataframe for state and year, if cached. If missing, must pass rda.path:
    df = NULL,
    # Responses to be reported:
    positives = list(q8 = c(2, 4), q9 = c(1, 2)),
    # Filters (e.g. demographic) to be applied to respondents:
    filter = list(q1 = c(4, 5, 6), # age 15-18
                  q2 = a(1),   # female
                  q5 = a(3)),  # black
    group_by = list("sex","grade"),
    # List of variables that responses should be grouped by.
    # style of confidence interval; argumment to svyciprop.
    confint = "xlogit"  # logit, mean, beta, likelihood
  )
  {
    ### If no cached df passed in, call function to read from file.
    if (is.null(df)) df = get.df.for.state.and.year(state, year, rda.path)
    if (class(df) != 'data.frame') return(df)

    ### Whether cached or read, double-check state and year.
    df = verify.df(df,state,year)
    if (class(df) != 'data.frame') return(df)  # it's an error message


    ### Create the "design" object for the weighted study design.
    design = svydesign(ids=~PSU, strata=~stratum, weights=~weight, data=df, nest=TRUE)

    ### Are all the column names mentioned in the arguments real?
    all.col.names = c(names(filter), names(positives), unlist(group_by))
    bad.col.names = all.col.names[!(all.col.names %in% colnames(df))]
    if (length(bad.col.names)>0) {
        return(paste0("ERROR: Bad column names: ", paste(bad.col.names,collapse=' '), '\n'))
    }
      
    ### From the filter criteria, construct a boolean vector to mask the rows.
    mask = construct.mask.from.filter(df, filter)
    #cat(sum(mask), "passed filters.\n")
    
    
    ### The group_by variables specify the dimensions of the final contingency table.
    ### Get a list of possible values for each variable, then create a "grid" of
    ### all possible combinations of values.  For each variable, we also add a -1 value,
    ### which represents "don't care" and lets us fill in the margins of the table.
    ### For example, if there are three group_by variables, each with 5 possible values, 
    ### the "grid" has 3 columns and (5+1)^3=216 rows, and the contingency table has 216 cells.
    
    ### First, create a list of vectors.  In the case of the aforementioned example, there
    ### will be three vectors in the list, each with 6 elements.
    all_by_vals = lapply(group_by, function(s) c(sort(unique(df[[s]])),-1))
    names(all_by_vals) = group_by

    ### expand.grid will turn the list into a 216 x 3 dataframe.
    grid = expand.grid(all_by_vals)
    #print(grid)
    
    ### Now we begin to build up the result, cell by cell. 
    ### We are building up a csv string, not a dataframe.
    ### Each cell is represented by a string terminated by '\n'.
    ### First we create a row of column headings.
    kol.names =  c(unlist(group_by),
                     t(outer(names(positives),
                            c(".count", ".pct", ".se", ".ci.lo", ".ci.hi"),
                            paste0)))
    result = NULL
    result.string = paste0(paste0(kol.names, collapse=','),'\n')
    
    #print(result)        
    assigned = 0  # For grins, keep track of total number assigned to grid.
    
    ### For each cell in grid (i.e., each combination of group-by values), do ...
    for (i in 1:nrow(grid)) {
        new.row = unlist(grid[i,])
        #print(new.row)
        ### Refine the mask to include only rows for this cell.
        ### mask tells us which rows pass the filter. 
        ### fine.mask will tell us which rows also contain the positive responses.
        fine.mask = mask
        #print(table(fine.mask, useNA="always"))
        for (s in group_by) {
            if (grid[i,s] == -1) next  ## -1 marks the 'total' case
            fine.mask = fine.mask & (!is.na(df[[s]]) & (df[[s]] == grid[i,s]))
            #print(table(fine.mask, useNA="always"))
        }
        #cat(sum(fine.mask), "filtered and in grid entry.\n")
        assigned = assigned + sum(fine.mask)
        
        ### for each question in positives, compute statistics for this grid cell.
        for (resp.name in names(positives)) {
            #cat("\nResponse",resp.name,"\n")
            resp.true = df[[resp.name]] %in% positives[[resp.name]]

            #cat(sum(resp.true), "interesting responses.\n")
            #cat(sum(resp.true & fine.mask), "interesting responses in this grid cell.\n")
            #cat(sum(fine.mask), "subjects in this grid cell.\n")

            count = sum(!is.na(df[[resp.name]]) & fine.mask)
            #cat("Count", count, "\n")
            
            if (count == 0) {
                new.row = c(new.row,count,0,0,0,0)
                next
            }
            proportion = sum(resp.true & fine.mask) / sum(fine.mask)
            #cat("Raw proportion", proportion, "\n")
            
            ss = subset(design,fine.mask)
            r.code = paste0("svyciprop(~(",resp.name,"%in%",cc(positives[[resp.name]]),"),",
                        "ss, method='xlogit', na.rm=TRUE)")
            #print(r.code)
            new.row = c(new.row,count,round(100*tidyresult(eval(parse(text=r.code))),2))

        }
        result = rbind(result,new.row)
        result.string = paste0(result.string,paste0(new.row, collapse=','),'\n')
    }
    #cat(assigned, "assigned to grid.\n")
    #cat("\n") 
    rownames(result) = NULL
    colnames(result) = kol.names
    #print(result) 
    #write.csv(result,"C:/Users/Rex/Desktop/foo.csv", row.names=FALSE)
    return(result.string)
  }
        
        
"OK"
