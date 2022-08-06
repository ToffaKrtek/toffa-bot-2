import * as fs from 'fs';

class FileWorker{
	constructor(fname){
		this.fname = fname;
	}
	read(){
		return JSON.parse(fs.readFileSync(this.fname))
	}
	readKey(key){
		const data = this.read();
		if (data[key]){
			return data[key];
		}
		return null;
	}
	write(newData){
		fs.writeFileSync(this.fname, JSON.stringify(newData));
	}
	writeKey(key, newData){

		const data = this.read();
		data[key] = newData;
		
		
		this.write(data);
	}
}
export default FileWorker;