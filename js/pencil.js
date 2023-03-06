class Pencil{
    constructor(grosor,form) {
        this.x=0;
        this.y=0;
        this.color='000000FF';
        this.form=form;
        this.grosor=grosor;
    }

    setColor(color){
        this.color=color;
    }
    getColor(){
        return this.color;
    }
    setGrosor(grosor){
        this.grosor=grosor;
    }
    setCord(x,y){
        this.x=x;
        this.y=y;
    }
    setForm(form){
        this.form=form;
    }
    getForm(){
        return this.form;
    }
    getGrosor(){
        return this.grosor;
    }


}