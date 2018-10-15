import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
import os
from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


engine  = create_engine("sqlite:///db/belly_button_biodiversity.sqlite")

# reflect Database
Base = automap_base()
Base.prepare(engine, reflect=True)
otu = Base.classes.otu
Samples_Metadata = Base.classes.samples_metadata
Samples = Base.classes.samples

#Database interface engine
session = Session(engine)


#Home Page
@app.route("/")
def index():
    """HOME"""
    return render_template("index.html")

#Route to list 
@app.route("/names")
def names():
    """List of Names"""

    # Use Pandas to perform the sql query
    output = session.query(Samples).statement
    df = pd.read_sql_query(output, session.bind)
    df.set_index('otu_id', inplace = True)

    # Return a list of the name 
    return jsonify(list(df.columns))

#Route to list OTU descriptions
@app.route('/otu')
def otu_list():
    otu_res = session.query(otu.lowest_taxonomic_unit_found).all()
    otu_list = []
    for res in otu_res:
        otu_list.append(res[0])


    #conver to json and return the list
    return jsonify(otu_list)

#Route to return json dictionary
@app.route("/metadata/<sample>")
def sample_metadata(sample):

    """METADATA"""

    bbtype, sample_number = sample.split("_")
    sample_data = session.query(Samples_Metadata).filter(Samples_Metadata.SAMPLEID == sample_number).all()
    sample_details = {}
    for each in sample_data:
        sample_details["SAMPLEID"] = each.SAMPLEID
        sample_details["ETHNICITY"] = each.ETHNICITY
        sample_details["GENDER"] = each.GENDER
        sample_details["AGE"] = each.AGE
        sample_details["LOCATION"] = each.LOCATION
        sample_details["BBTYPE"] = each.BBTYPE

    #return in JSON file
    return jsonify(sample_details)   

#Route to object contain
@app.route("/samples/<sample>")
def samples(sample):
    """OTU_ID & Sample Value"""
    output = session.query(Samples).statement
    df = pd.read_sql_query(output, session.bind)

    # fileter data
    sample_data = df[df[sample]>1].sort_values(by=sample,ascending=False)

    # formate data in to JSON file
    data = {
        "otu_ids": sample_data[sample].index.values.tolist(),
        "sample_values": sample_data[sample].values.tolist(),
    }
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)