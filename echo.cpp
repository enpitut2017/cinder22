#include<iostream>
using namespace std;
int main(){
	string s;
	while(true){
		cin >> s;
		for(int i = 0;i < 4;i++){
			cout << s << i << endl;
		}
	}
}
