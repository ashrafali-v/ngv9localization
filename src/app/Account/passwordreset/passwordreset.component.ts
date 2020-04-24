import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html'
})
export class PasswordresetComponent implements OnInit {
  passwordResetToken: string;
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.passwordResetToken = this.route.snapshot.queryParamMap.has('resetToken') ?
    this.route.snapshot.queryParamMap.get('resetToken') : '';
  }

}
