#include<iostream>
using namespace std;
int main(){
	string s;
	while(true){
		cin >> s;
		if(s == "end"){cout << "Bye" << endl;return 0;}
		cout << ">> "<< s << endl;
	}
}
